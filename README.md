# IHK AP1 — Prüfungssimulator

Локальный тренажёр для Teil 1 der gestreckten Abschlussprüfung («Einrichten eines
IT-gestützten Arbeitsplatzes»). Без сервера, без интернета, без API-ключей:
открываешь `index.html` двойным кликом и решаешь.

**10 экзаменов 2021–2026 · 279 Teilaufgaben · 173 карточки · тренажёры Netzplan,
Gantt, UML-Aktivitäts- и Klassendiagramm.**

Из 279 заданий 21 (87 баллов) помечены как **вне действующего каталога** —
они видны и решаются как обычно, но с пометкой «kannst du überspringen».
Подробности ниже.

| Экзамен | Teilaufgaben | Экзамен | Teilaufgaben |
|---|---|---|---|
| Herbst 2021   | 23 | Frühjahr 2024 | 30 |
| Frühjahr 2022 | 30 | Herbst 2024   | 26 |
| Herbst 2022   | 27 | Frühjahr 2025 | 30 |
| Frühjahr 2023 | 24 | Herbst 2025   | 31 |
| Herbst 2023   | 31 | Frühjahr 2026 | 27 |

---

## Prüfungskatalog ab 2025

Каталог AP1 обновили: часть тем ушла целиком, часть сузили. Симулятор знает
об этом и помечает такие задания.

**Вычеркнуто из AP1** (SQL и RAID — прямо в предисловии каталога: они теперь
только во второй части экзамена):

SQL и нереляционные БД · RAID · SAN/JBOD · Struktogramm и PAP (остался
псевдокод) · наследование и полиморфизм · LTE/5G · SWOT · ISO 2700x ·
ISO 9126 и критерии качества ПО · модели разработки кроме Wasserfall и Scrum
(Kanban, XP, V-Modell) · виды документации · Eisbergmodell · Benchmarking ·
Cross-Selling

**Сузили:** порты и протоколы (длинный список заменён на «сетевые протоколы,
напр. Ethernet, IP, DNS» + OSI — номера портов зубрить не надо, OSI надо) ·
виртуализация и облако (только виртуальные десктопы, SaaS и DaaS — Docker и
типы гипервизоров не нужны).

Такие задания **не выкидываются из экзамена** — они на месте, читаются и
решаются, но помечены красным: «Kannst du überspringen» плюс объяснение, почему
тема больше не спрашивается. Экзамен остаётся целым, просто видно, что можно
пропустить. Если хочется совсем убрать их с глаз — галочка **«veraltete
ausblenden»** в шапке (по умолчанию выключена).

Из статистики и приоритетов вычеркнутые темы исключены всегда: учить их
незачем, и портить ими расчёт не надо.

Раздел **«Lücken im Katalog»** на главной показывает обратное: темы, которые
каталог добавил, и сколько заданий в этой сборке их покрывает. Десять из них
не встречаются ни в одном из десяти экзаменов — их надо учить отдельно.

Правила лежат в `exams/katalog.json`. Каталог изменится — правишь этот файл и
запускаешь `python tools/tag_katalog.py && python tools/build_index.py`.
Источник: [IT-Berufe-Podcast #190](https://it-berufe-podcast.de/neuer-pruefungskatalog-fuer-die-ap1-der-it-berufe-ab-2025-it-berufe-podcast-190/).

---
## Как пользоваться

Открой `index.html`. Всё остальное — из интерфейса.

### Стартовый экран

- **карточки экзаменов** — прогресс, лучшая оценка, сколько баллов вне каталога
- **Übungsmodus** — выбираешь темы, количество и порядок. Фильтры «только что
  я завалила» и «только ungeübte». Без таймера
- **Netzplan-Trainer** — программа генерирует случайный сетевой график, ты
  заполняешь FAZ/FEZ/SAZ/SEZ/GP/FP, кнопка «Prüfen» подсвечивает красным то,
  что не сошлось, не показывая правильный ответ. «Lösung zeigen» заполняет всё
  и печатает критический путь. Планы всегда с настоящими буферами.
  Кнопка «Eigenen Netzplan eingeben» принимает список вида `A,2,B C` — по
  строке на Vorgang: имя, длительность, последователи. Так можно тренировать
  график из настоящего экзамена, открыв его скан кнопкой «Vollständige Seite»
- **UML-Trainer** — кнопки «Aktivitätsdiagramm üben» и «Klassendiagramm üben».
  Программа сочиняет случайную Ausgangssituation по-немецки (шесть сюжетов,
  у Aktivität ещё четыре формы: ветвление со слиянием, цикл с возвратом,
  Parallelisierung и смешанная), ты заполняешь таблицу: у Aktivität — узлы
  с типом (Start / Aktion / Entscheidung / Parallelisierung / Synchronisation /
  Ende), нацеленными на них Nachfolger и условиями; у Klassendiagramm —
  классы с атрибутами, методами и «erbt von» плюс отдельная таблица
  ассоциаций с кратностями.
  «Prüfen» проверяет две вещи. Нотацию: ровно один Startknoten, у Entscheidung
  минимум два выхода с разными условиями, из Aktion выходит одна стрелка,
  Synchronisation сводит минимум два потока, методы со скобками, кратность
  в формате `1:n` (`1..*`, `n:m`, `0..1` тоже принимаются). И содержание —
  сверяет с тем заданием, которое было сгенерировано: чего не хватает, что
  выдумано, где не тот тип узла или не та стрелка. Расхождения подсвечиваются
  красным, правильный ответ при этом не показывается — как «Prüfen» в Netzplan.
  «Lösung zeigen» рисует эталон настоящей нотацией (SVG: раута, балки Fork/Join,
  кружок с кольцом, кастрюли классов с тремя секциями, полая стрелка наследования)
  и печатает его же списком
- **Karteikarten** — 173 карточки, вытащенные из эталонных решений: термины и
  короткие вопросы. Что не знала — вернётся в той же пачке. Пробел
  переворачивает, стрелки вправо/влево — «знала / не знала»
- **Suche** — полнотекстовый поиск по заданиям и решениям
- **Themen: Stärken, Schwächen, Prioritäten** — главная таблица, см. ниже
- **Lücken im Katalog** — новые темы каталога и покрытие. Строку можно нажать,
  откроются подходящие задания
- **Fortschritt sichern** — экспорт и импорт всего прогресса одним JSON


### Приоритеты: что учить первым

Раздел «Themen: Stärken, Schwächen, Prioritäten» отвечает на вопрос
«с чего начать», а не просто «что я знаю плохо».

Три числа на каждую тему:

| Столбец | Что это |
|---|---|
| **BE / Prüfung** | сколько баллов тема стоит в среднем в **одном** экзамене. Считается по всем десяти экзаменам; если задание относится к двум темам, его баллы делятся пополам, поэтому сумма по столбцу сходится к 92 (100 минус вычеркнутое) |
| **Deine Quote** | твой процент по оценённым заданиям темы, с пометкой stark / mittel / schwach |
| **Verlust** | **BE / Prüfung × (1 − Quote)** — сколько баллов эта тема отнимает у тебя на настоящем экзамене |

Сортировка по последнему столбцу. Отсюда и берётся приоритет:

- **Kalkulation** — 22 балла за экзамен. Даже при 55 % это потеря 10 баллов →
  приоритет **hoch**
- **KI** — 2 балла за экзамен. Даже при 33 % это потеря 1,5 балла →
  приоритет **niedrig**

То есть слабая, но редкая тема вниз; средняя, но дорогая — наверх.

Наверху **одно число**: оценка IHK по той части экзамена, которую ты уже
проверила, и сколько баллов из ста это покрывает. Пока проверено мало —
число нестабильное, так и написано.

Темы, где ещё ни одно задание не оценено, идут отдельной таблицей ниже,
отсортированные по частоте: приоритет там неизвестен, но начинать логично
с самой дорогой.

Кнопка **«üben»** в конце строки сразу запускает тренировку по этой теме.

### Экзаменационный бланк

- таймер 90 минут, переживает перезагрузку; ответы автосохраняются
- слева Ausgangssituation, оглавление, Anlagen
- «nächste offene ↓» или `Alt` + `↓` — прыжок к первой неотвеченной
- задания-таблицы разбиты на **отдельные поля** с подписями и своими баллами
  плюс общее поле для черновых расчётов
- **«Antwort prüfen»** сверяет твой ответ с эталоном офлайн: числа с допуском
  0,5 % и ключевые термины. Показывает, что нашлось и чего не хватает, и
  предлагает балл. Это словарное сопоставление, а не проверяющий — решение
  всё равно читать
- в правой колонке самооценка баллов, внизу процент и оценка IHK
- «Vollständige Seite ansehen» — исходный скан страницы. Где эталон нарисован,
  под Musterlösung появляется «Lösungsseite ansehen»
- **«Drucken»** печатает бланк без решений и подсказок — можно решать на бумаге

### После сдачи

Экран Auswertung: твой ответ и эталон рядом, кнопки баллов, сверка чисел и
терминов, итог с оценкой.

- «Markdown für Claude» / «In Zwischenablage» — выгрузка бланка на проверку
- «Punkte einfügen» — вставить ответный блок с баллами, они проставятся сами
- «Ergebnis speichern» — попытка уходит в историю и статистику

Всё хранится в localStorage браузера. Другой браузер или инкогнито — другая
история; для переезда есть экспорт.

## Структура папки

```
ihk-sim/
├── index.html              симулятор — открывать этот файл
├── exams/
│   ├── exams.js            собранные данные, их читает index.html
│   ├── ap1-YYYY-x.json     готовый экзамен (схема v2)
│   ├── *.text.json         тексты заданий (промежуточный файл)
│   ├── *.figures.json      координаты вырезанных схем
│   ├── katalog.json        правила: что ушло из каталога, что добавили
│   ├── luecken.json        покрытие новых тем каталога (генерируется)
│   ├── cards.json          флешкарты (генерируется)
│   └── topics.override.json  ручные правки тем
├── assets/                 схемы, полные страницы, страницы решений (PNG)
├── raw/                    исходные PDF
├── tools/                  скрипты конвейера
├── books/                  учебники (к симулятору не относятся)
├── _work/                  разобранные решения, черновики
└── _archiv/                старое, можно удалить
```

`assets/` обязательно рядом с `index.html` — иначе картинки не подгрузятся.

---

## Как добавить новый экзамен

Нужен `pymupdf`: `pip install pymupdf`

**1. Схемы и страницы (локально, бесплатно)**

```bash
python tools/extract_figures.py raw/ap1-2027-f-aufgaben.pdf --exam-id ap1-2027-f
python tools/render_loesung.py ap1-2027-f
```

**2. Решения**

Сначала проверь, есть ли текстовый слой:

```bash
python -c "import pymupdf; d=pymupdf.open('raw/ap1-2027-f-loesung.pdf'); print(sum(len(p.get_text()) for p in d))"
```

Больше нескольких тысяч символов — текстовый слой есть, тогда:

```bash
python tools/parse_loesung.py raw/ap1-2027-f-loesung.pdf -o _work/ap1-2027-f.loesung.json
```

Ноль или почти ноль — это скан, решения надо распознавать (см. ниже).

**3. Тексты заданий**

Задания в этих PDF почти всегда сканы. Файл `exams/ap1-2027-f.text.json`
пишется распознаванием — см. раздел «Распознавание».

**4. Сборка**

```bash
python tools/assemble.py ap1-2027-f     # сшить тексты + решения + схемы
python tools/normalize.py               # привести к схеме v2
python tools/tag_topics.py              # проставить темы
python tools/check.py                   # проверить, что всё сошлось
python tools/build_index.py             # пересобрать exams/exams.js
```

`check.py` должен сказать `0 ошибок`. Если сумма баллов не 100 — где-то
потерялась Teilaufgabe.

---

## Распознавание сканов

**Не делай это в чате.** Каждая страница-картинка съедает тысячи токенов
из лимита подписки. В проекте для этого есть `tools/parse_exam.py`, который
ходит в API напрямую с твоего компьютера: один экзамен стоит примерно
$0.35–0.50 реальных денег, и каждая страница кэшируется в `.cache/` —
повторный прогон бесплатный и мгновенный.

Один раз:

```powershell
pip install pymupdf anthropic
setx ANTHROPIC_API_KEY "sk-ant-..."
```

Ключ — на console.anthropic.com → API Keys. **Перезапусти терминал** после
`setx`. Проверка: `python tools/parse_exam.py --list-models`.

Прогон:

```powershell
# холостой — рендер и оценка стоимости, без вызовов API
python tools/parse_exam.py --aufgaben "raw/ap1-2027-f-aufgaben.pdf" --exam-id ap1-2027-f --dry-run

# боевой
python tools/parse_exam.py `
  --aufgaben  "raw/ap1-2027-f-aufgaben.pdf" `
  --loesungen "raw/ap1-2027-f-loesung.pdf" `
  --exam-id   ap1-2027-f `
  --title     "Einrichten eines IT-gestützten Arbeitsplatzes" `
  --part AP1 --year 2027 --season Frühjahr --minutes 90
```

Флаги: `--offline` — только из кэша; `--dpi 300` — схемы чётче; удалить
`.cache/` — заставить перечитать заново.

**Что проверить после.** Vision-модель читает текст хорошо, но это не
детерминированный OCR. Сомнительные символы помечаются `<?>` и подсвечиваются
в интерфейсе жёлтым — сверь их с PDF руками. В первую очередь цены, объёмы,
IP-адреса и маски подсети. Для каждой подзадачи сохранена полная страница,
кнопка «Vollständige Seite ansehen» открывает оригинал.

---

## Скрипты

| Скрипт | Что делает |
|---|---|
| `extract_figures.py` | режет схемы и рендерит полные страницы заданий |
| `render_loesung.py`  | рендерит страницы Lösungs-PDF (для рисунков-эталонов) |
| `parse_loesung.py`   | вытаскивает Musterlösungen из текстового PDF |
| `parse_exam.py`      | распознаёт сканы через Vision API |
| `assemble.py`        | сшивает тексты + решения + схемы в готовый экзамен |
| `normalize.py`       | приводит любой экзамен к схеме v2 |
| `tag_topics.py`      | проставляет темы; ручные правки в `topics.override.json` |
| `check.py`           | валидация перед сборкой |
| `tag_katalog.py`     | помечает вычеркнутые темы, считает пробелы каталога |
| `extract_pruefhilfe.py` | вытаскивает числа и термины для офлайн-проверки |
| `split_felder.py`    | превращает задания-таблицы в отдельные поля ввода |
| `build_cards.py`     | делает флешкарты (`--anki файл.tsv` — экспорт в Anki) |
| `build_index.py`     | собирает `exams/exams.js` |

Полный порядок при правке данных:

```bash
python tools/normalize.py
python tools/tag_topics.py
python tools/tag_katalog.py
python tools/extract_pruefhilfe.py
python tools/split_felder.py --apply
python tools/build_cards.py --anki _work/anki-ap1.tsv
python tools/check.py
python tools/build_index.py
```

Забыла `build_index` — интерфейс покажет старые данные.

---

## Схема данных (v2)

```jsonc
{
  "schemaVersion": 2,
  "examId": "ap1-2026-f",
  "meta":      { "title", "part", "year", "season", "durationMinutes", "maxPoints" },
  "situation": { "text": "...", "assets": [] },
  "tasks": [{
    "id": "a1", "number": 1, "label": "Aufgabe 1", "intro": "...", "maxPoints": 25,
    "subtasks": [{
      "id": "1aa", "label": "aa)", "fullLabel": "1 aa)",
      "groupLabel": null, "groupIntro": null,     // общий текст для aa)/ab)/ac)
      "prompt": "...", "maxPoints": 4,
      "answerType": "text" | "diagram",
      "topics": ["netzwerk", "kalkulation"],
      "solution": { "text": "...", "image": "assets/..._loesung_02.png",
                    "solutionPage": 2, "extractionConfidence": "high" },
      "sourcePage": 2,
      "assets":  [{ "id", "file", "sourcePage", "width", "height" }],
      "pageImage": "assets/ap1-2026-f_seite_02.png",
      "placeholder": null,      // подсказка для задач-рисунков
      "needsReview": false,
      "katalog":  { "status": "veraltet" | "reduziert" | null,
                    "grund": "...", "themen": ["RAID"], "treffer": ["raid"] },
      "pruefung": { "zahlen":   [{ "text": "448 Mbit/s", "wert": 448, "einheit": "Mbit/s" }],
                    "begriffe": ["Vertraulichkeit", "802.3at"] },
      "felder":   [{ "label": "Notebook — Vorteil", "maxPoints": 0.5 }]
    }]
  }],
  "gradingScale": "ihk-100"
}
```

Темы: `projekt`, `kalkulation`, `netzwerk`, `itsicherheit`, `datenschutz`,
`hardware`, `software`, `daten`, `arbeitsplatz`, `ki`, `programmierung`,
`kommunikation`.

---

## Шкала IHK (100 баллов)

| Punkte | Note |
|---|---|
| 100–92 | 1 sehr gut |
| 91–81 | 2 gut |
| 80–67 | 3 befriedigend |
| 66–50 | 4 ausreichend |
| 49–30 | 5 mangelhaft |
| 29–0 | 6 ungenügend |
