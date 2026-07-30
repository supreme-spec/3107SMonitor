import { prisma } from "../db.js";
import logger, { logInfo, logError, logWarn } from "../src/lib/logger.js";

// ─── Service ──────────────────────────────────────────────────────────────────

export class OperatorService {
  /**
   * Получает список всех активных операторов.
   */
  async listActiveOperators(): Promise<any[]> {
    return await prisma.operator.findMany({
      where: { active: true },
      orderBy: { created_at: "asc" },
    });
  }

  /**
   * Получает оператора по login.
   */
  async findByLogin(login: string): Promise<any | null> {
    return await prisma.operator.findUnique({
      where: { login },
    });
  }

  /**
   * Создаёт нового оператора.
   */
  async createOperator(data: {
    login: string;
    display_name: string;
    role?: string;
    active?: boolean;
  }): Promise<any> {
    return await prisma.operator.create({
      data,
    });
  }

  /**
   * Обновляет оператора.
   */
  async updateOperator(id: number, data: any): Promise<any> {
    return await prisma.operator.update({
      where: { id },
      data,
    });
  }

  /**
   * Получает все вердикты оператора.
   */
  async getOperatorVerdicts(operatorId: number, options?: { limit?: number; status?: string }) {
    const where: any = { operator_id: operatorId };

    if (options?.status) {
      where.incident = { status: options.status };
    }

    return await prisma.operatorVerdict.findMany({
      where,
      include: {
        incident: true,
        operator: true,
      },
      orderBy: { timestamp: "desc" },
      take: options?.limit || 50,
    });
  }

  /**
   * Проверяет, голосовал ли оператор по данному инциденту.
   */
  async hasVoted(operatorId: number, incidentId: number): Promise<boolean> {
    const count = await prisma.operatorVerdict.count({
      where: {
        operator_id: operatorId,
        incident_id: incidentId,
      },
    });

    return count > 0;
  }

  /**
   * Получает статистику по оператору.
   */
  async getOperatorStats(operatorId: number): Promise<any> {
    const verdicts = await prisma.operatorVerdict.findMany({
      where: { operator_id: operatorId },
    });

    const stats = {
      total: verdicts.length,
      confirm: verdicts.filter((v: any) => v.decision === "CONFIRM").length,
      reject: verdicts.filter((v: any) => v.decision === "REJECT").length,
      aiError: verdicts.filter((v: any) => v.decision === "AI_ERROR").length,
      needsReview: verdicts.filter((v: any) => v.decision === "NEEDS_REVIEW").length,
    };

    return stats;
  }
}

//Singleton
export const operatorService = new OperatorService();