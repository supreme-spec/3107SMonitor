import { prisma } from "../db.js";
import logger, { logInfo, logError, logWarn, logDebug } from "../src/lib/logger.js";

// ─── Конфигурация политики ─────────────────────────────────────────────────────

const MIN_OPERATORS_FOR_CONFIRM = parseInt(process.env.MIN_OPERATORS_FOR_CONFIRM || "3");
const MIN_OPERATORS_FOR_REJECT = parseInt(process.env.MIN_OPERATORS_FOR_REJECT || "2");
const CONFIRM_THRESHOLD_PCT = parseInt(process.env.CONFIRM_THRESHOLD_PCT || "70");
const REJECT_THRESHOLD_PCT = parseInt(process.env.REJECT_THRESHOLD_PCT || "50");

// ─── Типы ─────────────────────────────────────────────────────────────────────

export interface VerdictStats {
  confirmCount: number;
  rejectCount: number;
  aiErrorCount: number;
  reviewCount: number;
  totalCount: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class IncidentResolutionService {
  /**
   * Оценивает инцидент и обновляет его статус на основе вердиктов операторов.
   * Возвращает новый статус или null, если нет изменений.
   */
  async evaluate(incidentId: number): Promise<string | null> {
    const incident = await prisma.recognitionIncident.findUnique({
      where: { id: incidentId },
      include: { decisions: { include: { operator: true } } },
    });

    if (!incident) {
      logWarn(`IncidentResolutionService: incident ${incidentId} not found`);
      return null;
    }

    const stats = this.computeStats(incident.decisions);
    const newStatus = this.determineStatus(incident.status, stats);

    if (newStatus && newStatus !== incident.status) {
      const updateData: any = { status: newStatus };

      if (newStatus === "CONFIRMED" || newStatus === "REJECTED" || newStatus === "NEEDS_REVIEW") {
        updateData.resolved_at = new Date();
      }

      await prisma.recognitionIncident.update({
        where: { id: incidentId },
        data: updateData,
      });

      logInfo(`Incident ${incidentId}: status changed from ${incident.status} to ${newStatus}`, {
        confirmCount: stats.confirmCount,
        rejectCount: stats.rejectCount,
        aiErrorCount: stats.aiErrorCount,
        reviewCount: stats.reviewCount,
      });

      return newStatus;
    }

    return null;
  }

  /**
   * Вычисляет статистику вердиктов.
   */
  private computeStats(decisions: any[]): VerdictStats {
    const stats: VerdictStats = {
      confirmCount: 0,
      rejectCount: 0,
      aiErrorCount: 0,
      reviewCount: 0,
      totalCount: decisions.length,
    };

    for (const d of decisions) {
      switch (d.decision) {
        case "CONFIRM":
          stats.confirmCount++;
          break;
        case "REJECT":
          stats.rejectCount++;
          break;
        case "AI_ERROR":
          stats.aiErrorCount++;
          break;
        case "NEEDS_REVIEW":
          stats.reviewCount++;
          break;
      }
    }

    return stats;
  }

  /**
   * Определяет новый статус на основе текущего и статистики.
   */
  private determineStatus(currentStatus: string, stats: VerdictStats): string | null {
    const total = stats.totalCount;

    // Если уже закрыт — ничего не меняем
    if (["CONFIRMED", "REJECTED", "NEEDS_REVIEW"].includes(currentStatus)) {
      return null;
    }

    // CONFIRMED: минимум N операторов, из них >= 70% подтвердили
    if (total >= MIN_OPERATORS_FOR_CONFIRM) {
      const confirmThreshold = Math.ceil(MIN_OPERATORS_FOR_CONFIRM * (CONFIRM_THRESHOLD_PCT / 100));
      if (stats.confirmCount >= confirmThreshold) {
        return "CONFIRMED";
      }
    }

    // REJECTED: минимум N операторов, из них >= 50% отклонили ИЛИ есть AI_ERROR
    if (total >= MIN_OPERATORS_FOR_REJECT) {
      const rejectThreshold = Math.ceil(MIN_OPERATORS_FOR_REJECT * (REJECT_THRESHOLD_PCT / 100));
      if (stats.rejectCount >= rejectThreshold || stats.aiErrorCount >= 1) {
        return "REJECTED";
      }
    }

    // NEEDS_REVIEW: если есть вердикты, но недостаточно для закрытия
    if (total >= 3) {
      return "NEEDS_REVIEW";
    }

    // PARTIAL_RESULT: если есть хотя бы 1 вердикт, но статус ещё не определён
    if (total > 0 && currentStatus === "NEW") {
      return "WAITING_OPERATORS";
    }

    return null;
  }

  /**
   * Проверяет, может ли конкретный оператор проголосовать по данному инциденту.
   * Один оператор может проголосовать только один раз.
   */
  async canOperatorVote(incidentId: number, operatorId: number): Promise<boolean> {
    const decision = await prisma.operatorVerdict.findFirst({
      where: { incident_id: incidentId, operator_id: operatorId },
    });

    return !decision;
  }

  /**
   * Создаёт вердикт и автоматически оценивает статус инцидента.
   */
  async createVerdict(
    incidentId: number,
    operatorId: number,
    decision: string,
    comment?: string,
    screenPath?: string
  ): Promise<any> {
    // Проверяем, не голосовал ли уже этот оператор
    if (!(await this.canOperatorVote(incidentId, operatorId))) {
      throw new Error("Operator has already voted on this incident");
    }

    // Создаём вердикт
    const verdict = await prisma.operatorVerdict.create({
      data: {
        incident_id: incidentId,
        operator_id: operatorId,
        decision,
        comment,
        screen_path: screenPath,
      },
      include: { operator: true },
    });

    // Автоматически оцениваем статус инцидента
    const newStatus = await this.evaluate(incidentId);

    return { verdict, newStatus };
  }
}

//Singleton
export const incidentResolutionService = new IncidentResolutionService();