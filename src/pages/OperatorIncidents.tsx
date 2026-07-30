import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import type { Camera, KrakenEvent } from '../types';
import { apiFetch } from '../api/client';
import clientLogger from '../lib/client-logger';
import { logError } from '../lib/logger';
import './OperatorIncidents.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OperatorVerdict {
  id: number;
  incident_id: number;
  operator_id: number;
  decision: 'CONFIRM' | 'REJECT' | 'AI_ERROR' | 'UNKNOWN' | 'NEEDS_REVIEW';
  screen_path?: string;
  comment?: string;
  timestamp: string;
  operator: {
    id: number;
    login: string;
    display_name: string;
  };
}

interface RecognitionIncident {
  id: number;
  original_photo_path: string;
  ai_candidate_person_id?: number;
  ai_confidence: number;
  status: 'NEW' | 'WAITING_OPERATORS' | 'PARTIAL_RESULT' | 'CONFIRMED' | 'REJECTED' | 'NEEDS_REVIEW';
  created_at: string;
  resolved_at?: string;
  decisions: OperatorVerdict[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OperatorIncidents() {
  const [incidents, setIncidents] = useState<RecognitionIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<RecognitionIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<RecognitionIncident[]>('/incidents');
      setIncidents(data);
      setError(null);
    } catch (err) {
      logError(err as Error, { context: 'fetch incidents' });
      setError('Не удалось загрузить инциденты');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleIncidentClick = useCallback((incident: RecognitionIncident) => {
    setSelectedIncident(incident);
  }, []);

  const handleCloseIncident = useCallback(() => {
    setSelectedIncident(null);
  }, []);

  const handleVerdict = async (incidentId: number, decision: string, comment?: string) => {
    try {
      const response = await apiFetch(`/incidents/${incidentId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          comment,
          operator_login: 'current_operator', // TODO: get from auth
        }),
      });

      // Refresh list
      fetchIncidents();
      setSelectedIncident(null);

      return response;
    } catch (err) {
      logError(err as Error, { context: 'submit verdict' });
      throw err;
    }
  };

  // ─── Loading/Error State ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-kraken-base">
        <div className="text-xl text-white">Загрузка инцидентов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-kraken-base">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  // ─── Incident Detail Modal ────────────────────────────────────────────────

  if (selectedIncident) {
    return (
      <IncidentDetail
        incident={selectedIncident}
        onClose={handleCloseIncident}
        onVerdict={handleVerdict}
        onRefresh={fetchIncidents}
      />
    );
  }

  // ─── Incident List ────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-kraken-base">
      <Sidebar currentPage="operator" onNavigate={() => {}} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar
          cameras={[]}
          selectedCameraId={null}
          onSelectCamera={() => {}}
          alertCount={0}
          onOpenAlerts={() => {}}
        />

        <div className="flex-1 p-4 overflow-hidden">
          <h1 className="text-2xl font-bold text-white mb-4">Очередь проверки</h1>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-900/50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-300">{incidents.length}</div>
              <div className="text-sm text-gray-400">Всего инцидентов</div>
            </div>
            <div className="bg-green-900/50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-300">
                {incidents.filter(i => i.status === 'NEW').length}
              </div>
              <div className="text-sm text-gray-400">Новые</div>
            </div>
            <div className="bg-yellow-900/50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-yellow-300">
                {incidents.filter(i => i.status === 'WAITING_OPERATORS').length}
              </div>
              <div className="text-sm text-gray-400">Ожидают проверки</div>
            </div>
          </div>

          <div className="bg-kraken-dark rounded-lg overflow-hidden shadow-lg border border-kraken-border">
            <table className="w-full text-left">
              <thead className="bg-kraken-header text-gray-300">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">AI Кандидат</th>
                  <th className="p-3">Уверенность</th>
                  <th className="p-3">Статус</th>
                  <th className="p-3">Создан</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                {incidents.map(incident => (
                  <tr
                    key={incident.id}
                    onClick={() => handleIncidentClick(incident)}
                    className="border-b border-kraken-border hover:bg-kraken-hover cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono text-sm">#{incident.id.toString().padStart(6, '0')}</td>
                    <td className="p-3">{incident.ai_candidate_person_id ? 'Известная персона' : 'Неизвестный'}</td>
                    <td className="p-3">{(incident.ai_confidence * 100).toFixed(1)}%</td>
                    <td className="p-3">
                      <StatusBadge status={incident.status} />
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(incident.created_at).toLocaleTimeString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {incidents.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Нет инцидентов для проверки
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles = {
    NEW: 'bg-blue-600 text-white',
    WAITING_OPERATORS: 'bg-yellow-600 text-white',
    PARTIAL_RESULT: 'bg-orange-600 text-white',
    CONFIRMED: 'bg-green-600 text-white',
    REJECTED: 'bg-red-600 text-white',
    NEEDS_REVIEW: 'bg-purple-600 text-white',
  };

  const labels = {
    NEW: 'Новый',
    WAITING_OPERATORS: 'Ожидают',
    PARTIAL_RESULT: 'Частично',
    CONFIRMED: 'Подтверждён',
    REJECTED: 'Отклонён',
    NEEDS_REVIEW: 'Требует повторной проверки',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-600'}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

function IncidentDetail({
  incident,
  onClose,
  onVerdict,
  onRefresh,
}: {
  incident: RecognitionIncident;
  onClose: () => void;
  onVerdict: (id: number, decision: string, comment?: string) => Promise<any>;
  onRefresh: () => void;
}) {
  const [verdict, setVerdict] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verdict) {
      setError('Выберите решение');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onVerdict(incident.id, verdict, comment || undefined);
      onRefresh();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-kraken-dark rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-kraken-border">
          <h2 className="text-xl font-bold text-white">Инцидент #{incident.id.toString().padStart(6, '0')}</h2>
          <StatusBadge status={incident.status} />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm text-gray-400 mb-2">Оригинальное фото</h3>
              <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                {incident.original_photo_path ? (
                  <img
                    src={`/snapshots/${incident.original_photo_path.split('/').pop()}`}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-500">Нет фото</span>
                )}
              </div>
            </div>

            <div className="bg-kraken-base rounded-lg p-4">
              <h3 className="text-sm text-gray-400 mb-2">AI Кандидат</h3>
              <div className="space-y-1">
                <p className="text-lg text-white">
                  {incident.ai_candidate_person_id ? 'Известная персона' : 'Неизвестный'}
                </p>
                <p className="text-sm text-gray-400">
                  Уверенность: {(incident.ai_confidence * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-400">
                  Создан: {new Date(incident.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
          </div>

          {incident.decisions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm text-gray-400 mb-2">Решения операторов</h3>
              <div className="bg-kraken-base rounded-lg overflow-hidden">
                {incident.decisions.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 border-b border-kraken-border last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{d.operator.display_name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        d.decision === 'CONFIRM' ? 'bg-green-900 text-green-300' :
                        d.decision === 'REJECT' ? 'bg-red-900 text-red-300' :
                        d.decision === 'AI_ERROR' ? 'bg-purple-900 text-purple-300' :
                        'bg-gray-800 text-gray-300'
                      }`}>
                        {d.decision === 'CONFIRM' ? '✅ Подтвердил' :
                         d.decision === 'REJECT' ? '❌ Отклонил' :
                         d.decision === 'AI_ERROR' ? '🤖 Ошибка AI' : '❓ Сомневается'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(d.timestamp).toLocaleTimeString('ru-RU')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-kraken-border bg-kraken-footer">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && (
              <div className="bg-red-900/50 text-red-200 p-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVerdict('CONFIRM')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  verdict === 'CONFIRM'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ✅ Подтвердить
              </button>

              <button
                type="button"
                onClick={() => setVerdict('REJECT')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  verdict === 'REJECT'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ❌ Отклонить
              </button>

              <button
                type="button"
                onClick={() => setVerdict('NEEDS_REVIEW')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  verdict === 'NEEDS_REVIEW'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ❓ Сомневаюсь
              </button>
            </div>

            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Комментарий (опционально)"
              className="w-full bg-kraken-base border border-kraken-border rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              rows={2}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                Отмена
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Отправка...' : 'Отправить решение'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}