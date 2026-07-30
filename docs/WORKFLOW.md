# Smart Security Monitor — Operator Workflow

## 1. Жизненный цикл RecognitionIncident

```
NEW
   ↓
WAITING_OPERATORS (когда накоплено N вердиктов)
   ↓
PARTIAL_RESULT (частичные вердикты, но не достаточно для закрытия)
   ↓
┌─────────────┬─────────────┬──────────────┐
CONFIRMED     REJECTED      NEEDS_REVIEW
```

### Состояния

| Состояние | Описание | Переходы |
|-----------|----------|----------|
| `NEW` | Инцидент создан, но нет вердиктов | → `WAITING_OPERATORS` |
| `WAITING_OPERATORS` | Ожидаются вердикты операторов | → `CONFIRMED`, `REJECTED`, `NEEDS_REVIEW`, `PARTIAL_RESULT` |
| `PARTIAL_RESULT` | Есть вердикты, но недостаточно для закрытия | → `CONFIRMED`, `REJECTED`, `NEEDS_REVIEW` |
| `CONFIRMED` | Инцидент подтверждён (AI верно опознал) | → ЗАКРЫТ |
| `REJECTED` | Инцидент отклонён (AI ошибся) | → ЗАКРЫТ |
| `NEEDS_REVIEW` | Требуется повторная проверка (нет однозначного решения) | → `CONFIRMED`, `REJECTED`, `REVIEWED` |

---

## 2. Роли и действия оператора

### Роли

| Роль | Права |
|------|-------|
| `reviewer` | Просмотр инцидентов, голосование (CONFIRM/REJECT/NEEDS_REVIEW) |
| `admin` | Все права reviewer + управление операторами, статистика |
| `validator` | Высшая верификация (только для спорных случаев) |

### Действия оператора

1. **Просмотр очереди**
   - Список инцидентов сортируется по времени создания
   - Статусы: `NEW`, `WAITING_OPERATORS`, `PARTIAL_RESULT`

2. **Просмотр инцидента**
   - Оригинальное фото
   - AI-кандидат (имя, категория, уверенность)
   - Список уже принятых вердиктов (оператор, решение, время)

3. **Принятие решения**
   - `✅ CONFIRM` — AI верно опознал
   - `❌ REJECT` — AI ошибся (это другой человек)
   - `❓ NEEDS_REVIEW` — не уверен, требуется вторая проверка

4. **Снимок экрана**
   - Кнопка "📸 СКРИН" сохраняет кадр для архива/обучения

---

## 3. Правила переходов между состояниями

### Конфигурируемые параметры

```env
MIN_OPERATORS_FOR_CONFIRM=3
MIN_OPERATORS_FOR_REJECT=2
CONFIRM_THRESHOLD_PCT=70
REJECT_THRESHOLD_PCT=50
```

### Логика закрытия

#### CONFIRMED
```
ЕСТЬ >= MIN_OPERATORS_FOR_CONFIRM
И КОЛИЧЕСТВО CONFIRM >= MIN_OPERATORS_FOR_CONFIRM * CONFIRM_THRESHOLD_PCT / 100
ТО ВЫСТАВЛЯЕМ status = CONFIRMED
```

#### REJECTED
```
ЕСТЬ >= MIN_OPERATORS_FOR_REJECT
И (КОЛИЧЕСТВО REJECT >= MIN_OPERATORS_FOR_REJECT
   ИЛИ КОЛИЧЕСТВО AI_ERROR >= 1)
ТО ВЫСТАВЛЯЕМ status = REJECTED
```

#### NEEDS_REVIEW
```
ЕСТЬ >= MIN_OPERATORS_FOR_REVIEW
И НЕ ПОЛУЧИЛОСЬ CONFIRMED
И НЕ ПОЛУЧИЛОСЬ REJECTED
ТО ВЫСТАВЛЯЕМ status = NEEDS_REVIEW
```

---

## 4. Пример сценария

```
Камера: Входная группа
AI: Распознал "Иванов Иван" с confidence=97%
Статус: NEW

↓

Оператор 1: ✅ CONFIRM
Статус: WAITING_OPERATORS
confirm_count=1

↓

Оператор 2: ✅ CONFIRM
Статус: WAITING_OPERATORS
confirm_count=2

↓

Оператор 3: ✅ CONFIRM
Статус: CONFIRMED (минимум 3 подтверждения достигнут)
resolved_at = now()
```

---

## 5. Интеграция с существующими сущностями

| Сущность | Связь с RecognitionIncident |
|-----------|------------------------------|
| `Event` | `source_event_id` — событие распознавания, которое породило инцидент |
| `Person` | `ai_candidate_person_id` — предложенный AI человек |
| `Operator` | `OperatorVerdict.operator_id` — кто принял решение |
| `ArchiveTask` | Может быть создан для хранения оригинального фото |

---

## 6. Политика по умолчанию (без изменения конфига)

- Минимум операторов для закрытия: **3**
- Порог подтверждения: **70%** (2 из 3)
- Порог отклонения: **50%** (2 из 3)

---

*Документ актуален на: 2026-07-30*
*Версия: 1.0*
