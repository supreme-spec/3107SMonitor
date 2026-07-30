import { prisma } from "../db.js";
import logger, { logInfo, logError, logWarn } from "../src/lib/logger.js";
import fs from "fs";
import path from "path";

// ─── Service ──────────────────────────────────────────────────────────────────

export class ArchiveService {
  /**
   * Создаёт новую сессию импорта.
   */
  async createImportSession(data: {
    operator_login?: string;
    workspace: string;
    machine_name?: string;
    app_version?: string;
    model_version?: string;
    gpu?: string;
    cpu?: string;
    workspace_version?: string;
    total_files: number;
  }): Promise<any> {
    return await prisma.importSession.create({
      data,
    });
  }

  /**
   * Получает сессию импорта с задачами.
   */
  async getImportSession(id: number): Promise<any | null> {
    return await prisma.importSession.findUnique({
      where: { id },
      include: { tasks: true },
    });
  }

  /**
   * Получает список всех сессий импорта.
   */
  async listImportSessions(options?: { limit?: number; status?: string }) {
    const where: any = {};

    if (options?.status) {
      where.status = options.status;
    }

    return await prisma.importSession.findMany({
      where,
      orderBy: { start_time: "desc" },
      include: { tasks: true },
      take: options?.limit || 50,
    });
  }

  /**
   * Завершает сессию импорта.
   */
  async completeImportSession(id: number, data: {
    completed?: number;
    rejected?: number;
    errors?: number;
    status?: string;
  }): Promise<any> {
    return await prisma.importSession.update({
      where: { id },
      data: {
        ...data,
        ended_at: new Date(),
      },
    });
  }

  /**
   * Создаёт новую задачу архивации.
   */
  async createArchiveTask(data: {
    photo_hash: string;
    photo_path: string;
    status?: string;
    import_session_id: number;
    embedding_error?: string;
    thumbnail_error?: string;
    database_error?: string;
    faiss_error?: string;
  }): Promise<any> {
    return await prisma.archiveTask.create({
      data,
    });
  }

  /**
   * Обновляет задачу архивации (checkpoint).
   */
  async updateArchiveTask(id: number, data: any): Promise<any> {
    return await prisma.archiveTask.update({
      where: { id },
      data,
    });
  }

  /**
   * Создаёт новый шаг выполнения задачи.
   */
  async createTaskStep(taskId: number, step: string): Promise<any> {
    return await prisma.archiveTaskStep.create({
      data: {
        task_id: taskId,
        step,
        status: "PENDING",
        started_at: new Date(),
      },
    });
  }

  /**
   * Обновляет статус шага выполнения.
   */
  async updateTaskStep(stepId: number, status: string, error?: string): Promise<any> {
    const updateData: any = { status };

    if (status === "OK" || status === "FAILED") {
      updateData.finished_at = new Date();
    }

    if (error) {
      updateData.error = error;
    }

    return await prisma.archiveTaskStep.update({
      where: { id: stepId },
      data: updateData,
    });
  }

  /**
   * Получает задачу по хешу фото и сессии.
   */
  async getTaskByHash(photoHash: string, importSessionId: number): Promise<any | null> {
    return await prisma.archiveTask.findFirst({
      where: { photo_hash: photoHash, import_session_id: importSessionId },
      include: { steps: true },
    });
  }

  /**
   * Обновляет статус задачи (основной этап).
   */
  async updateTaskStatus(taskId: number, status: string): Promise<any> {
    return await prisma.archiveTask.update({
      where: { id: taskId },
      data: { status },
    });
  }

  /**
   * Получает статистику по сессии импорта.
   */
  async getImportSessionStats(sessionId: number): Promise<any> {
    const tasks = await prisma.archiveTask.findMany({
      where: { import_session_id: sessionId },
    });

    const stats = {
      total: tasks.length,
      new: tasks.filter((t: any) => t.status === "NEW").length,
      loaded: tasks.filter((t: any) => t.status === "LOADED").length,
      faceDetected: tasks.filter((t: any) => t.status === "FACE_DETECTED").length,
      embeddingCreated: tasks.filter((t: any) => t.status === "EMBEDDING_CREATED").length,
      thumbnailCreated: tasks.filter((t: any) => t.status === "THUMBNAIL_CREATED").length,
      databaseSaved: tasks.filter((t: any) => t.status === "DATABASE_SAVED").length,
      faissIndexed: tasks.filter((t: any) => t.status === "FAISS_INDEXED").length,
      completed: tasks.filter((t: any) => t.status === "COMPLETED").length,
      errors: tasks.filter((t: any) => t.status === "FAILED" || t.status === "ERROR").length,
    };

    return stats;
  }

  /**
   * Удаляет задачу (и все её шаги) по хешу.
   */
  async deleteTaskByHash(photoHash: string, importSessionId: number): Promise<void> {
    await prisma.archiveTask.deleteMany({
      where: { photo_hash: photoHash, import_session_id: importSessionId },
    });
  }
}

//Singleton
export const archiveService = new ArchiveService();