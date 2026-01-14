class SchedulerApp {
    constructor() {
        this.date = new Date();
        this.selectedDate = new Date(); // Currently selected date in UI
        this.events = JSON.parse(localStorage.getItem('ghibli_events')) || {};
        this.healthData = JSON.parse(localStorage.getItem('ghibli_health')) || {};

        // --- DOM Elements ---
        this.grid = document.getElementById('calendar-grid');
        this.monthLabel = document.getElementById('current-month');
        this.prevBtn = document.getElementById('prev-month');
        this.nextBtn = document.getElementById('next-month');
        this.yearSelect = document.getElementById('year-select');
        this.headerWareki = document.getElementById('header-wareki');

        this.eventList = document.getElementById('event-list');
        this.selectedDateLabel = document.getElementById('selected-date-label');
        this.addEventBtn = document.getElementById('add-event-btn');

        this.modal = document.getElementById('event-modal');
        this.modalForm = document.getElementById('event-form');
        this.closeModalBtn = document.getElementById('close-modal');
        this.voiceBtn = document.getElementById('voice-btn');
        this.voiceStatus = document.getElementById('voice-status');

        // Stamp Buttons
        this.stampBtns = document.querySelectorAll('.stamp-btn');

        // Hanko Buttons
        this.hankoMedicine = document.getElementById('hanko-medicine');
        this.hankoTaiso = document.getElementById('hanko-taiso');

        // Tools
        this.zoomBtn = document.getElementById('zoom-btn');
        this.printBtn = document.getElementById('print-btn');

        // Guide
        this.guideText = document.getElementById('guide-text');

        this.init();
    }

    init() {
        this.initYearSelect();
        this.renderCalendar();
        this.renderEventList();
        this.updateGuide();
        this.initLocationGuide();

        // Listeners
        this.prevBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextBtn.addEventListener('click', () => this.changeMonth(1));

        // Header Controls
        this.yearSelect.addEventListener('change', (e) => this.changeYear(e.target.value));
        this.zoomBtn.addEventListener('click', () => document.body.classList.toggle('large-text'));
        this.printBtn.addEventListener('click', () => window.print());

        // Modal
        this.addEventBtn.addEventListener('click', () => this.openModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.modalForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Stamp Actions
        this.stampBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const title = btn.dataset.label;
                const icon = btn.dataset.stamp;
                this.quickAddEvent(`${icon} ${title}`);
            });
        });

        // Hanko Actions
        this.hankoMedicine.addEventListener('click', () => this.toggleHealth('medicine'));
        this.hankoTaiso.addEventListener('click', () => this.toggleHealth('taiso'));

        // Voice Input
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.lang = 'ja-JP';
            this.recognition.onstart = () => {
                this.voiceStatus.classList.remove('hidden');
                this.voiceBtn.classList.add('bg-red-500', 'animate-pulse');
            };
            this.recognition.onend = () => {
                this.voiceStatus.classList.add('hidden');
                this.voiceBtn.classList.remove('bg-red-500', 'animate-pulse');
            };
            this.recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                document.getElementById('event-title').value = text;
            };

            this.voiceBtn.addEventListener('click', () => {
                this.recognition.start();
            });
        } else {
            this.voiceBtn.style.display = 'none'; // Hide if not supported
        }
    }

    initYearSelect() {
        const currentYear = new Date().getFullYear();
        // Range: -5 to +5 years
        for (let y = currentYear - 5; y <= currentYear + 5; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.text = `${y}年`;
            if (y === currentYear) opt.selected = true;
            this.yearSelect.appendChild(opt);
        }
    }

    getDateKey(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    // --- Japanese Calendar Logic ---
    getWareki(year) {
        // Simple Reiwa check
        const reiwaStart = 2019;
        if (year >= reiwaStart) {
            const ry = year - reiwaStart + 1;
            return ry === 1 ? '令和元年' : `令和${ry}年`;
        }
        return ''; // Keep simple for now
    }

    // Rokuyo removed as per request
    // Solar Term removed as per request
    // ----------------------------

    renderCalendar() {
        this.grid.innerHTML = '';

        const year = this.date.getFullYear();
        const month = this.date.getMonth();

        // Update Headers
        this.monthLabel.innerText = `${year}年 ${month + 1}月`;
        // Print title
        document.getElementById('print-title').innerText = `${year}年 ${month + 1}月`;

        this.headerWareki.innerText = this.getWareki(year);
        this.yearSelect.value = year;

        // Days logic
        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();

        const todayKey = this.getDateKey(new Date());
        const selectedKey = this.getDateKey(this.selectedDate);

        // Previous Month Padding
        for (let i = firstDayIndex; i > 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day', 'other-month');
            dayDiv.innerText = prevLastDay - i + 1;
            this.grid.appendChild(dayDiv);
        }

        // Current Days
        for (let i = 1; i <= lastDay; i++) {
            const currentLoopDate = new Date(year, month, i);
            const key = this.getDateKey(currentLoopDate);

            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');

            // Inner Layout
            // Date Number
            const num = document.createElement('div');
            num.innerText = i;
            num.className = "text-lg font-bold leading-none";
            dayDiv.appendChild(num);

            // Info Row (Removed Rokuyo / Solar Terms)

            // Events Dots
            const events = this.events[key] || [];
            if (events.length > 0) {
                const dotContainer = document.createElement('div');
                dotContainer.className = "event-dot-container";
                // Max 3 dots
                for (let k = 0; k < Math.min(events.length, 3); k++) {
                    const dot = document.createElement('div');
                    dot.className = "event-dot";
                    dotContainer.appendChild(dot);
                }
                dayDiv.appendChild(dotContainer);

                // For Print: Add Text
                events.forEach(ev => {
                    const printText = document.createElement('div');
                    printText.className = "print-event-text";
                    printText.innerText = `• ${ev.title}`;
                    dayDiv.appendChild(printText);
                });
            }

            if (key === todayKey) dayDiv.classList.add('today');
            if (key === selectedKey) dayDiv.classList.add('selected');

            dayDiv.addEventListener('click', () => {
                this.selectedDate = new Date(year, month, i);
                this.renderCalendar();
                this.renderEventList();
                this.updateGuide();
            });

            this.grid.appendChild(dayDiv);
        }

        // Fill remaining
        const totalCells = firstDayIndex + lastDay;
        const nextDays = (totalCells > 35) ? 42 - totalCells : 35 - totalCells;

        for (let i = 1; i <= nextDays; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day', 'other-month');
            dayDiv.innerText = i;
            this.grid.appendChild(dayDiv);
        }
    }

    renderEventList() {
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const m = this.selectedDate.getMonth() + 1;
        const d = this.selectedDate.getDate();
        const w = days[this.selectedDate.getDay()];
        this.selectedDateLabel.innerText = `${m}月${d}日 (${w})`;

        // Update Hanko State
        const key = this.getDateKey(this.selectedDate);
        const health = this.healthData[key] || {};

        this.updateHankoUI(this.hankoMedicine, health.medicine, '済');
        this.updateHankoUI(this.hankoTaiso, health.taiso, '完');

        // Render List
        this.eventList.innerHTML = '';
        const dayEvents = this.events[key] || [];

        if (dayEvents.length === 0) {
            this.eventList.innerHTML = `
                <div class="text-center text-gray-400 py-8 font-bold opacity-50">
                    <i class="fas fa-mug-hot text-4xl mb-2"></i><br>
                    予定はありません・ゆっくりしましょう
                </div>
            `;
            return;
        }

        dayEvents.sort((a, b) => a.time.localeCompare(b.time));

        dayEvents.forEach((ev, index) => {
            const el = document.createElement('div');
            el.className = 'bg-white p-3 rounded-xl shadow-paper border-l-8 border-forest-green flex justify-between items-center transform transition hover:scale-[1.02]';
            el.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="text-lg font-bold text-forest-green bg-forest-cream px-2 rounded">${ev.time}</div>
                    <div class="font-bold text-lg text-forest-dark">${ev.title}</div>
                </div>
                <button class="text-red-300 hover:text-red-500 p-2 transition" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            el.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('けしますか？')) {
                    this.deleteEvent(key, index);
                }
            });

            this.eventList.appendChild(el);
        });
    }

    updateHankoUI(el, isChecked, label) {
        // Clear old stamp
        const old = el.querySelector('.hanko-stamp');
        if (old) old.remove();

        if (isChecked) {
            el.classList.add('checked');
            const stamp = document.createElement('div');
            stamp.className = 'hanko-stamp';
            stamp.innerText = label;
            el.querySelector('div').appendChild(stamp);
        } else {
            el.classList.remove('checked');
        }
    }

    // --- Actions ---

    initLocationGuide() {
        const btn = document.getElementById('guide-location-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("お使いのブラウザでは位置機能が使えません。");
                return;
            }

            this.guideText.innerText = "ふむふむ... あなたの場所を確認しています...";

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.showLocationRecommendation(latitude, longitude);
                },
                (error) => {
                    console.error(error);
                    this.guideText.innerText = "場所がわかりませんでした。森が深いようです。";
                }
            );
        });
    }

    showLocationRecommendation(lat, lon) {
        // Mock Recommendation Logic
        // In a real app, this would call the Google Places API or similar.
        // Here, we provide "Atmospheric" recommendations based on pseudo-random logic.

        const spots = [
            "近くに「木漏れ日カフェ」という素敵な場所がありそうです。",
            "少し歩くと、静かな公園が見つかるかもしれません。",
            "この辺りには、美味しいパン屋さんがある予感がします。",
            "風が気持ちいいですね。近くの川沿いを散歩してみては？",
            "「星屑堂」という雑貨屋さんが近くにあるみたいですよ。",
            "古い図書館で本を読むのも良い午後になりそうです。"
        ];

        const randomSpot = spots[Math.floor(Math.random() * spots.length)];
        this.guideText.innerText = `ふぉっふぉ。${randomSpot}`;
    }

    quickAddEvent(title) {
        const time = "10:00";
        const key = this.getDateKey(this.selectedDate);
        if (!this.events[key]) this.events[key] = [];
        this.events[key].push({ title, time });
        this.saveEvents();
        this.renderCalendar();
        this.renderEventList();

        alert(`「${title}」を追加しました`);
    }

    toggleHealth(type) {
        const key = this.getDateKey(this.selectedDate);
        if (!this.healthData[key]) this.healthData[key] = {};

        this.healthData[key][type] = !this.healthData[key][type];

        localStorage.setItem('ghibli_health', JSON.stringify(this.healthData));
        this.renderEventList(); // Re-render ui
    }

    changeMonth(delta) {
        this.date.setMonth(this.date.getMonth() + delta);
        this.renderCalendar();
    }

    changeYear(year) {
        this.date.setFullYear(parseInt(year));
        this.renderCalendar();
    }

    updateGuide() {
        // Guide Logic (Updated: Removed Rokuyo and Solar Terms)
        const d = this.selectedDate.getDate();

        const msgs = [
            "お茶でも飲んで一息入れましょう。",
            "今日の体調はいかがですか？",
            "散歩日和かもしれません。",
            "忘れた予定はありませんか？",
            "深呼吸して、リラックス。",
            "ゆっくり歩くのも、いい運動です。",
            "夜は暖かくして寝ましょうね。"
        ];

        // Simple random-ish message based on date
        const msg = msgs[d % msgs.length];

        this.guideText.innerText = msg;
    }

    // Modal & CRUD
    openModal() {
        this.modal.classList.remove('hidden');
        const now = new Date();
        const nextHour = new Date(now.setHours(now.getHours() + 1, 0));
        document.getElementById('event-time').value = nextHour.toTimeString().substring(0, 5);
        document.getElementById('event-title').focus();
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.modalForm.reset();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('event-title').value;
        const time = document.getElementById('event-time').value;
        const key = this.getDateKey(this.selectedDate);

        if (!this.events[key]) this.events[key] = [];
        this.events[key].push({ title, time });

        this.saveEvents();
        this.closeModal();
        this.renderCalendar();
        this.renderEventList();
    }

    deleteEvent(key, index) {
        this.events[key].splice(index, 1);
        if (this.events[key].length === 0) delete this.events[key];
        this.saveEvents();
        this.renderCalendar();
        this.renderEventList();
    }

    saveEvents() {
        localStorage.setItem('ghibli_events', JSON.stringify(this.events));
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    new SchedulerApp();
});
