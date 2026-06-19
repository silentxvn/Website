// ==UserScript==
// @name         FB Auto Report V15.0 Bảy ngôn ngữ (Jehy Clean UI - Tối ưu Meta)
// @namespace    http://tampermonkey.net/
// @version      15.0
// @description  Giao diện Jehy nhỏ gọn, tốc độ tùy chỉnh có giới hạn cho Meta, chống ngủ, 13 loại report
// @author       Gemini & Jehy
// @match        https://www.facebook.com/*
// @match        https://m.facebook.com/*
// @match        https://touch.facebook.com/*
// @match        https://mbasic.facebook.com/*
// @match        https://web.facebook.com/*
// @match        https://*.facebook.com/*
// @grant        none
// ==/UserScript==

(async () => {
    'use strict';

    // ==========================================
    // CẤU HÌNH CHUNG (DELAY ĐƯỢC ĐIỀU CHỈNH BẰNG THANH TRƯỢT - CÓ GIỚI HẠN CHO META)
    // ==========================================
    const SHOW_BORDERS = true;
    const SOMETHING_RETRIES = 5;
    const MAX_RETRIES = 6;

    // Tốc độ cơ bản (ms) – thanh trượt sẽ thay đổi giá trị này
    let speed = 700;

    // Các delay phụ thuộc tốc độ nhưng có giới hạn tối thiểu để Meta không bị bỏ qua
    const MIN_DELAY = 400;               // Tối thiểu cho các click thường
    const MIN_ACTION_DELAY = 900;        // Tối thiểu cho Submit/Next/Done
    const MIN_META_DELAY = 1000;         // Tối thiểu cho chờ Meta xuất hiện

    let DELAY_TIME = Math.max(speed, MIN_DELAY);
    let INPUT_DELAY = Math.max(speed * 2, MIN_ACTION_DELAY);
    let WAIT_FOR_ACTION = Math.max(speed * 2, MIN_ACTION_DELAY);
    let DONE_DELAY = Math.max(speed, MIN_DELAY);
    let INTER_REPORT_DELAY = Math.max(speed, MIN_DELAY);
    let LOOP_DELAY = Math.max(speed * 3, MIN_ACTION_DELAY * 2);

    function updateDelays() {
        DELAY_TIME = Math.max(speed, MIN_DELAY);
        INPUT_DELAY = Math.max(speed * 2, MIN_ACTION_DELAY);
        WAIT_FOR_ACTION = Math.max(speed * 2, MIN_ACTION_DELAY);
        DONE_DELAY = Math.max(speed, MIN_DELAY);
        INTER_REPORT_DELAY = Math.max(speed, MIN_DELAY);
        LOOP_DELAY = Math.max(speed * 3, MIN_ACTION_DELAY * 2);
    }

    // ==========================================
    // ĐA NGÔN NGỮ
    // ==========================================
    const LANG = {
        menu: [
            "Profile settings see more options",
            "プロフィール設定のその他のオプションを見る",
            "その他のオプション",
            "その他のアクション",
            "プロフィール設定のその他のオプション","प्रोफ़ाइल सेटिंग पर ले जाने वाला 'और विकल्प देखें' बटन","Paramètres du profil voir plus d’options","프로필 설정 더 보기 옵션","个人主页设置“查看更多”选项"
        ],
        reportProfile: [
            "Report profile", "Báo cáo trang cá nhân", "プロフィールを報告","प्रोफाइल रिपोर्ट गर्नुहोस्","प्रोफ़ाइल की रिपोर्ट करें","Signaler le profil","프로필 신고","举报个人主页"
        ],
        somethingAbout: [
            "Something about this profile", "Có gì đó về trang cá nhân này", "このプロフィールに関すること","यो प्रोफाइलका बारेमा केही कुरा","इस प्रोफ़ाइल के बारे में कुछ जानकारी","Quelque chose à propos de ce profil","이 프로필에 관한 정보","关于这个主页的内容"
        ],
        fakeProfile: [
            "Fake profile", "Trang cá nhân giả mạo", "偽プロフィール","नक्कली प्रोफाइल","फ़र्ज़ी प्रोफ़ाइल","Faux profil","허위 프로필","虚假个人主页"
        ],
        notRealPerson: [
            "not a real person", "real person", "không phải người thật", "実在しない人物である","उहाँ वास्तविक व्यक्ति होइन","ये कोई असली व्यक्ति नहीं है","Ce n’est pas une vraie personne","실제 인물이 아닙니다","不是真人"
        ],
        celebrity: [
            "celebrity", "public figure", "A celebrity or public figure",
            "Người nổi tiếng hoặc nhân vật công chúng",
            "有名人・著名人","सेलिब्रेटी वा प्रसिद्ध व्यक्ति","सेलिब्रिटी या सार्वजनिक हस्ती","Une célébrité ou une personnalité publique","유명인 또는 공인","名人或公众人物"
        ],
        under18: [
            "under 18", "involving someone", "dưới 18", "18歳未満の人物が関わる問題","18 वर्षभन्दा कम उमेरको कोही संलग्न भएको समस्या","यह 18 साल से कम उम्र के किसी व्यक्ति की समस्या से संबंधित है","Problème impliquant une personne de moins de 18 ans","Problème impliquant une personne de moins de 18 aán ","personne de moins de 18 ans","moins de 18 ans","Problème impliquant une ","18세 미만인 사용자와 관련된 문제","18세","18세 미만인 사용자와 관련된 문제 ","18세 미만인 사용자와","问题涉及未满 18 岁的用户","问题涉及未满 18 "
        ],
        physicalAbuse: [
            "Physical abuse", "Bạo hành thể chất", "身体的虐待","शारीरिक दुर्व्यवहार","यह शारीरिक दुर्व्यवहार से संबंधित है","Maltraitance physique","신체적 학대","身体虐待"
        ],
        violent: [
            "Violent",
            "hateful",
            "disturbing",
            "Bạo lực",
            "暴力的、不快、または悪意があるコンテンツ","हिंसात्मक, घृणापूर्ण वा बाधा पुर्‍याउने सामग्री",
            "इसमें हिंसक, नफ़रत फैलाने वाला या असहज करने वाला कंटेंट है","Contenu violent, haineux ou dérangeant","폭력적이거나, 혐오스럽거나, 불편함을 주는 콘텐츠","暴力、仇恨或令人不适的内容"
        ],
        credibleThreat: [
            "Credible threat", "threat to safety", "Đe dọa đáng tin",
            "信頼できる脅威", "脅迫", "暴力の脅威", "安全性への脅威","सुरक्षामा प्रमाणिक खतरा","यह सुरक्षा के लिए गंभीर खतरा है","Menace crédible pour la sécurité","현실성이 있는 안전 위협","真实的安全威胁"
        ],
        scamFraud: [
            "Scam", "fraud", "false information", "Lừa đảo", "詐欺または虚偽の情報","स्क्याम, ठगी वा झुटो जानकारी","यह स्कैम, धोखाधड़ी या गलत जानकारी है","Arnaque, fraude ou fausses informations","스캠, 사기 또는 거짓 정보","欺诈、诈骗或虚假信息"
        ],
        fraudOrScam: [
            "Fraud or scam", "Lừa đảo hoặc gian lận", "詐欺行為","ठगी वा स्क्याम","धोखाधड़ी या स्कैम","Fraude ou arnaque","거짓 또는 사기","欺诈或诈骗"
        ],
        spam: [
            "Spam", "Tin rác", "スパム","स्प्याम","स्पैम","Spam","스팸","垃圾信息"
        ],
        somethingElse: [
            "Something else", "Điều gì đó khác","अरू केही","कोई और समस्या है",
            "その他",
            "その他の問題",
            "その他の理由","Autre","기타 문제","其他"
        ],
        suicideOrSelfHarm: [
            "Suicide or self-harm",
            "自殺または自傷行為",
            "आत्महत्या वा आफैलाई चोट पुर्‍याउने",
            "यह आत्महत्या या खुद को नुकसान पहुँचाने से संबंधित है","Suicide ou automutilation","자살 또는 자해","自杀或自我伤害"
        ],
        adultContent: [
            "Adult content", "成人向けコンテンツ","वयस्क सामग्री","इसमें अश्लील कंटेंट है","Contenu réservé aux adultes","성인용 콘텐츠","成人内容"
        ],
        submit: [
            "Submit", "Gửi", "Send", "送信","पेस गर्नुहोस्","सबमिट करें","Envoyer","제출","提交"
        ],
        done: [
            "Done", "Xong", "Hoàn tất", "Close", "Đóng", "完了","सम्पन्न भयो","ओके","Terminé","완료","完成"
        ],
        next: [
            "Next", "Tiếp", "Tiếp tục", "次へ","अर्को","आगे बढ़ें","Suivant","다음","继续"
        ],
        terrorism: [
            "Seems like terrorism", "テロリズムだと思われる","आतङ्कवाद जस्तो देखिन्छ","यह आतंकवाद जैसा लग रहा है","Ressemble à du terrorisme","테러리즘인 것 같음","似乎涉及恐怖主义"
        ],
        callingForViolence: [
            "Calling for violence", "暴力を呼びかけている","हिंसाका लागि आह्वान","इसमें लोगों को हिंसा करने के लिए उकसाया गया है","Appel à la violence","폭력을 유도함","煽动暴力行为"
        ],
        organizedCrime: [
            "Seems like organized crime", "組織的犯罪と思われる","सङ्गठित अपराध जस्तो देखिन्छ","संगठित अपराध जैसा लग रहा है","Cela ressemble à du crime organisé","조직범죄인 것 같음","似乎是有组织犯罪"
        ],
        eatingDisorder: [
            "Eating disorder", "摂食障害","खानपानसम्बन्धी विकार","भोजन संबंधी विकार","Troubles alimentaires","섭식 장애","饮食失调"
        ],
        harassment: [
            "Bullying or harassment", "いじめまたは嫌がらせ", "डरधम्की वा दुर्व्यवहार","यह कंटेंट धमकाने या उत्पीड़न करने से संबंधित है","Intimidation ou harcèlement","따돌림 또는 괴롭힘","欺凌或骚扰"
        ],
        adultProstitution: [
            "Seems like prostitution", "売春だと思われる","वेश्यावृत्ति जस्तो देखिन्छ","यह कंटेंट वेश्यावृत्ति जैसा लग रहा है","Ressemble à de la prostitution","성매매인 것 같음","似乎涉及卖淫"
        ],
        me: [
            "Me", "Tôi", "自分","म","मैं","Moi","나","我"
        ]
    };

    const INPUT_XPATH =
        "//*[@aria-label=\"Facebook Page name or URL\" " +
        "or @aria-label=\"Facebookページ名またはURL\" " +
        "or @aria-label=\"Facebook पृष्ठको नाम वा URL\" " +
        "or @aria-label=\"Facebook पेज का नाम या URL\" " +
        "or @aria-label=\"Nom ou URL de la Page Facebook\" " +
        "or @aria-label=\"Facebook 公共主页名称或网址\" " +
        "or @aria-label=\"Facebook 페이지 이름 또는 URL\"]";

    // ==========================================
    // HÀM TIỆN ÍCH
    // ==========================================
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const getElementByXpath = (path) => {
        if (!path) return null;
        try { return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; }
        catch(e) { return null; }
    };
    const isInsidePanel = (el) => el.closest('#fb-auto-panel') !== null;

    function safeClick(el, showBorder = SHOW_BORDERS) {
        if (!el) return false;
        el.scrollIntoView({block: "center", inline: "center"});
        if (el.hasAttribute('aria-hidden')) el.removeAttribute('aria-hidden');
        if (showBorder) {
            el.style.outline = '3px solid #FF1493';
            el.style.outlineOffset = '2px';
        }
        el.focus();
        const opts = { bubbles: true, cancelable: true, view: window };
        el.dispatchEvent(new MouseEvent('pointerdown', opts));
        el.dispatchEvent(new MouseEvent('mousedown', opts));
        el.dispatchEvent(new MouseEvent('pointerup', opts));
        el.dispatchEvent(new MouseEvent('mouseup', opts));
        el.dispatchEvent(new MouseEvent('click', opts));
        return true;
    }

    function findActionButton(keywords) {
        const selectors = ['button', 'div[role="button"]', 'a[role="button"]', 'span[role="button"]', 'div[role="menuitem"]', 'div[tabindex="0"]'];
        let all = [...document.querySelectorAll(selectors.join(','))];
        all = all.filter(el => el.offsetParent !== null && !isInsidePanel(el));
        for (let el of all) {
            let txt = (el.innerText || "").trim().toLowerCase().replace(/[''']/g, "'").replace(/["""]/g, '"');
            for (let k of keywords) {
                let kw = k.toLowerCase().replace(/[''']/g, "'").replace(/["""]/g, '"');
                if (txt === kw || txt.includes(kw)) return el;
            }
        }
        return null;
    }

    function findButtonByKeywords(keywords) {
        let all = document.querySelectorAll('div[role="button"], button, span, div[role="menuitem"], div[tabindex="0"], li, a, div[role="option"]');
        for (let el of all) {
            if (!el.offsetParent || isInsidePanel(el)) continue;
            let txt = (el.innerText || "").trim().toLowerCase().replace(/[''']/g, "'").replace(/["""]/g, '"');
            for (let k of keywords) {
                let kw = k.toLowerCase().replace(/[''']/g, "'").replace(/["""]/g, '"');
                if (txt.includes(kw)) {
                    let clickable = el.closest('div[role="button"], button') || el;
                    clickable.scrollIntoView({block: "center", inline: "center"});
                    return clickable;
                }
            }
        }
        return null;
    }

    function simulateInputWithTracker(element, text) {
        element.focus();
        let lastValue = element.value;
        element.value = text;
        let event = new Event('input', { bubbles: true });
        let tracker = element._valueTracker;
        if (tracker) { tracker.setValue(lastValue); }
        element.dispatchEvent(event);
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function findMenuElement() {
        for (let lbl of LANG.menu) {
            let el = document.querySelector(`[aria-label="${lbl}"]`);
            if (el && el.offsetParent && !isInsidePanel(el)) return el;
        }
        let partial = document.querySelector('[aria-label*="プロフィール設定のその他のオプション"]');
        if (partial && partial.offsetParent && !isInsidePanel(partial)) return partial;
        let allBtns = document.querySelectorAll('div[role="button"], button, span[role="button"]');
        for (let btn of allBtns) {
            if (!btn.offsetParent || isInsidePanel(btn)) continue;
            if (btn.innerText.includes('その他') || btn.innerText.includes('Other') || btn.innerText.includes('More') || btn.innerText.includes('…')) {
                return btn.closest('div[role="button"], button') || btn;
            }
        }
        return null;
    }

    // Hàm clickMetaResult có delay phụ thuộc tốc độ nhưng không dưới MIN_META_DELAY
    async function clickMetaResult() {
        const metaWait = Math.max(speed, MIN_META_DELAY); // Tối thiểu 1 giây
        for (let retry = 4; retry > 0; retry--) {
            let options = document.querySelectorAll('div[role="listbox"] span, ul[role="listbox"] span, div[role="presentation"] span');
            for (let span of options) {
                if (!span.offsetParent || isInsidePanel(span)) continue;
                if (span.innerText.trim() === "Meta") {
                    safeClick(span);
                    await sleep(metaWait); // Chờ Meta được chọn
                    return true;
                }
            }
            let imgs = document.querySelectorAll('div[role="listbox"] img');
            if (imgs.length > 0) {
                safeClick(imgs[0]);
                await sleep(metaWait);
                return true;
            }
            if (retry === 2 || retry === 1) {
                let inp = getElementByXpath(INPUT_XPATH);
                if (inp) {
                    simulateInputWithTracker(inp, "Meta ");
                    await sleep(metaWait);
                }
            }
            await sleep(500); // Cố định giữa các lần thử
        }
        return false;
    }

    async function findAndClickSomethingElse() {
        let keywords = LANG.somethingElse;
        let candidates = [];
        let all = document.querySelectorAll('div[role="button"], button, span, div[role="menuitem"], div[tabindex="0"], li, a, div');
        for (let el of all) {
            if (!el.offsetParent || isInsidePanel(el)) continue;
            let txt = (el.innerText || "").trim().toLowerCase().replace(/[''']/g, "'").replace(/["""]/g, '"');
            for (let k of keywords) {
                let kw = k.toLowerCase().replace(/[''']/g, "'").replace(/["""]/g, '"');
                if (txt === kw || txt.includes(kw)) {
                    candidates.push(el);
                    break;
                }
            }
        }
        if (candidates.length === 0) return false;
        let target = candidates[candidates.length - 1];
        if (SHOW_BORDERS) {
            target.style.outline = '3px solid #FF1493';
            target.style.outlineOffset = '2px';
            await sleep(300);
        }
        if (safeClick(target, false)) return true;
        let parent = target.closest('button, div[role="button"]');
        if (parent && !isInsidePanel(parent) && safeClick(parent, false)) return true;
        let current = target;
        while (current) {
            if (isInsidePanel(current)) break;
            if (safeClick(current, false)) return true;
            current = current.parentElement;
            if (current && current.tagName === 'BODY') break;
        }
        return false;
    }

    // ==========================================
    // 13 LOẠI BÁO CÁO
    // ==========================================
    const reportTypes = [
        {
            name: "Violent - Terrorism",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Violent content", keywords: LANG.violent },
                { name: "Terrorism", keywords: LANG.terrorism },
                { name: "Submit", keywords: LANG.submit, action: true },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Violent - Calling for violence",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Violent content", keywords: LANG.violent },
                { name: "Calling for violence", keywords: LANG.callingForViolence },
                { name: "Submit", keywords: LANG.submit, action: true },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Violent - Organized crime",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Violent content", keywords: LANG.violent },
                { name: "Organized crime", keywords: LANG.organizedCrime },
                { name: "Submit", keywords: LANG.submit, action: true },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Suicide - Eating disorder",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Suicide or self-harm", keywords: LANG.suicideOrSelfHarm },
                { name: "Eating disorder", keywords: LANG.eatingDisorder },
                { name: "Submit", keywords: LANG.submit, action: true },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Scam - Fraud or scam",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Scam, fraud", keywords: LANG.scamFraud },
                { name: "Fraud or scam", keywords: LANG.fraudOrScam },
                { name: "Submit", keywords: LANG.submit, action: true },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Scam - Spam",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Scam, fraud", keywords: LANG.scamFraud },
                { name: "Spam", keywords: LANG.spam },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Celebrity",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Fake profile", keywords: LANG.fakeProfile },
                { name: "Celebrity or public figure", keywords: LANG.celebrity },
                { name: "Nhập tên Meta", inputData: "Meta ", special: "input" },
                { name: "Chọn Meta", special: "meta" },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Submit", keywords: LANG.submit, action: true },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Fake - Not a real person",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Fake profile", keywords: LANG.fakeProfile },
                { name: "Not a real person", keywords: LANG.notRealPerson },
                { name: "Submit", keywords: LANG.submit, action: true },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Something else",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Something else", special: "somethingElse" },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Bullying - Harassment",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Under 18", keywords: LANG.under18 },
                { name: "Bullying or harassment", keywords: LANG.harassment },
                { name: "Submit", keywords: LANG.submit, action: true },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Adult - Prostitution",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Adult content", keywords: LANG.adultContent },
                { name: "Prostitution", keywords: LANG.adultProstitution },
                { name: "Submit", keywords: LANG.submit, action: true },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Physical abuse",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Under 18", keywords: LANG.under18 },
                { name: "Physical abuse", keywords: LANG.physicalAbuse },
                { name: "Submit", keywords: LANG.submit, action: true },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        },
        {
            name: "Credible threat",
            steps: [
                { name: "Menu", special: "menu" },
                { name: "Report profile", keywords: LANG.reportProfile },
                { name: "Something about", keywords: LANG.somethingAbout, optional: true },
                { name: "Violent content", keywords: LANG.violent },
                { name: "Credible threat", keywords: LANG.credibleThreat },
                { name: "Submit", keywords: LANG.submit, action: true },
                { name: "Next", keywords: LANG.next, action: true },
                { name: "Done", keywords: LANG.done, action: true, done: true }
            ]
        }
    ];

    // ==========================================
    // ANTI-SLEEP
    // ==========================================
    let audioLoop = null, titleInterval = null;
    let antiSleepEnabled = true;
    const SILENT_AUDIO = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAADFMYXZjNTguMzUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAIAAAAASAA8AxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjM1LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjM1LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjM1LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjM1LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjM1LjEwMAAAAAAAAAAAAAAA';
    function startAntiSleep() {
        if (!audioLoop) { audioLoop = new Audio(SILENT_AUDIO); audioLoop.loop = true; audioLoop.volume = 0.01; }
        audioLoop.play().catch(() => {});
        let tick = false;
        if (titleInterval) clearInterval(titleInterval);
        titleInterval = setInterval(() => {
            document.title = tick ? `🌸 Đã báo cáo: ${totalReportsDone}` : `🎀 Đã báo cáo: ${totalReportsDone}`;
            tick = !tick;
        }, 2000);
    }
    function stopAntiSleep() {
        if (audioLoop) audioLoop.pause();
        if (titleInterval) { clearInterval(titleInterval); document.title = "Facebook"; }
    }

    // ==========================================
    // GIAO DIỆN JEHY CLEAN DASHBOARD - THU NHỎ HƠN + FIX MINI
    // ==========================================
    let isPaused = false, shouldStop = false, isRunning = false, isMini = false;
    let totalReportsDone = 0;
    let totalLoopsCompleted = 0;
    let skippedSteps = [];
    let progressPercent = 0;
    let currentTaskName = "Chưa chạy";
    let statusText = "Sẵn sàng";
    let statusColor = "#16A34A";

    const panel = document.createElement("div");
    panel.id = "fb-auto-panel";
    Object.assign(panel.style, {
        position: "fixed",
        top: "70px",
        left: "18px",
        width: "240px",
        padding: "0",
        zIndex: "999999",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif",
        color: "#111827",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.65)",
        background: "rgba(255,255,255,0.88)",
        boxShadow: "0 12px 30px rgba(15,23,42,0.18)",
        backdropFilter: "blur(16px)",
        overflow: "hidden",
        userSelect: "none",
        fontSize: "11px"
    });

    // Drag
    let isDragging = false, dragStartX, dragStartY, panelStartX, panelStartY;
    panel.addEventListener('pointerdown', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;
        e.preventDefault();
        isDragging = true;
        dragStartX = e.clientX; dragStartY = e.clientY;
        const rect = panel.getBoundingClientRect();
        panelStartX = rect.left; panelStartY = rect.top;
        panel.style.transition = 'none';
        panel.setPointerCapture(e.pointerId);
    });
    panel.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - dragStartX, dy = e.clientY - dragStartY;
        panel.style.left = (panelStartX + dx) + 'px';
        panel.style.top = (panelStartY + dy) + 'px';
        panel.style.right = 'auto';
    });
    panel.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        panel.releasePointerCapture(e.pointerId);
        panel.style.transition = '';
    });
    panel.addEventListener('pointercancel', (e) => {
        if (!isDragging) return;
        isDragging = false;
        panel.releasePointerCapture(e.pointerId);
        panel.style.transition = '';
    });
    panel.addEventListener('selectstart', e => { if (isDragging) e.preventDefault(); });

    function renderPanel() {
        if (isMini) {
            panel.innerHTML = `
                <div style="padding:6px 8px; background:rgba(17,24,39,.92); color:white;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <div style="width:20px; height:20px; border-radius:7px; background:linear-gradient(135deg,#FF6AA2,#7C3AED); display:flex; align-items:center; justify-content:center;">🌸</div>
                        <div style="flex:1; min-width:0;">
                            <div style="height:5px; border-radius:99px; background:rgba(255,255,255,.18); overflow:hidden;">
                                <div id="miniBar" style="width:${progressPercent}%; height:100%; background:linear-gradient(90deg,#FF6AA2,#FDBA74,#60A5FA);"></div>
                            </div>
                            <div id="miniText" style="margin-top:3px; font-size:9px; color:#E5E7EB; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${statusText}</div>
                        </div>
                        <button id="btnExpand" style="border:none; background:rgba(255,255,255,.14); color:#fff; border-radius:7px; padding:3px 7px; cursor:pointer; font-weight:900;">+</button>
                    </div>
                    <div id="miniStats" style="margin-top:4px; font-size:8px; color:#CBD5E1;">Báo cáo: ${totalReportsDone} • Vòng: ${totalLoopsCompleted}</div>
                </div>
            `;
            panel.style.width = "190px";
            panel.style.borderRadius = "14px";
            panel.querySelector("#btnExpand").onclick = () => {
                isMini = false;
                Object.assign(panel.style, {
                    width: "240px",
                    borderRadius: "16px",
                    overflow: "hidden"
                });
                renderPanel();
            };
            return;
        }

        panel.innerHTML = `
            <div style="padding:10px; background:linear-gradient(135deg,#111827,#1F2937); color:white;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-size:14px; font-weight:900; letter-spacing:.2px;">🌸 FB AUTO REPORT V15.0</div>
                        <div style="margin-top:2px; font-size:9px; color:#CBD5E1;">Bảy ngôn ngữ | Jehy UI</div>
                    </div>
                    <button id="btnMini" style="border:none; background:rgba(255,255,255,.12); color:white; border-radius:8px; padding:3px 7px; cursor:pointer; font-weight:900;">—</button>
                </div>
                <div style="margin-top:10px; display:flex; gap:6px;">
                    <div style="flex:1; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:8px;">
                        <div style="font-size:8px; color:#CBD5E1;">HOÀN THÀNH</div>
                        <div id="totalDone" style="font-size:20px; font-weight:900; margin-top:2px;">${totalReportsDone}</div>
                    </div>
                    <div style="flex:1; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:8px;">
                        <div style="font-size:8px; color:#CBD5E1;">VÒNG</div>
                        <div id="loopCount" style="font-size:20px; font-weight:900; margin-top:2px;">${totalLoopsCompleted}</div>
                    </div>
                </div>
            </div>

            <div style="padding:10px;">
                <div style="display:grid; grid-template-columns:1fr; gap:6px; margin-bottom:8px;">
                    <div style="border:1px solid #E5E7EB; border-radius:12px; padding:8px; background:#F9FAFB;">
                        <div style="font-size:9px; color:#6B7280; margin-bottom:3px;">TÁC VỤ HIỆN TẠI</div>
                        <div id="currentTask" style="font-weight:900; color:#111827; font-size:12px;">${currentTaskName}</div>
                    </div>
                    <div style="border:1px solid #E5E7EB; border-radius:12px; padding:8px; background:#FFFFFF;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-size:9px; color:#6B7280;">TRẠNG THÁI</div>
                                <div id="statusText" style="font-weight:900; color:${statusColor}; margin-top:3px; font-size:11px;">${statusText}</div>
                            </div>
                            <div style="width:36px; height:36px; border-radius:12px; background:${isRunning ? "#DCFCE7" : "#F3F4F6"}; display:flex; align-items:center; justify-content:center; font-size:16px;">
                                ${isRunning ? "⚡" : "⏳"}
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:5px;">
                        <b style="color:#374151;">Tiến trình</b>
                        <b id="progressText" style="color:#111827;">${progressPercent}%</b>
                    </div>
                    <div style="height:8px; border-radius:99px; background:#E5E7EB; overflow:hidden;">
                        <div id="progressBar" style="height:100%; width:${progressPercent}%; background:linear-gradient(90deg,#FF6AA2,#F59E0B,#3B82F6); transition:width .25s ease;"></div>
                    </div>
                </div>

                <div style="border:1px solid #E5E7EB; border-radius:12px; padding:8px; background:#F9FAFB; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <b style="font-size:10px; color:#374151;">Tốc độ</b>
                        <b id="speedText" style="font-size:10px; color:#DB2777;">${(speed / 1000).toFixed(1)}s</b>
                    </div>
                    <input id="speedRange" type="range" min="200" max="3000" step="100" value="${speed}" style="width:100%; accent-color:#DB2777; cursor:pointer;">
                </div>

                <div style="display:flex; align-items:center; gap:4px; margin-bottom:6px;">
                    <input type="checkbox" id="chkAntiSleep" ${antiSleepEnabled ? 'checked' : ''} style="accent-color:#DB2777; cursor:pointer; width:13px; height:13px;">
                    <label for="chkAntiSleep" style="font-size:10px; color:#374151; cursor:pointer; font-weight:bold;">🎀 Chống ngủ Tab</label>
                </div>

                <div style="display:flex; gap:4px; margin-bottom:4px;">
                    <button id="btnStart" style="flex:1; padding:6px 4px; border:none; border-radius:10px; background:linear-gradient(135deg,#16A34A,#22C55E); color:#fff; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(34,197,94,.18); font-size:11px;">🌸 CHẠY</button>
                    <button id="btnPause" style="display:none; flex:1; padding:6px 4px; border:none; border-radius:10px; background:linear-gradient(135deg,#F59E0B,#FDBA74); color:#111827; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(245,158,11,.18); font-size:11px;">⏸️ DỪNG</button>
                </div>

                <div style="display:flex; gap:4px;">
                    <button id="btnStop" style="display:none; flex:1; padding:6px 4px; border:none; border-radius:10px; background:linear-gradient(135deg,#EF4444,#F43F5E); color:#fff; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(239,68,68,.18); font-size:11px;">⏹️ DỪNG</button>
                    <button id="btnReset" style="flex:1; padding:6px 4px; border:none; border-radius:10px; background:#EEF2FF; color:#3730A3; font-weight:800; cursor:pointer; font-size:11px;">RESET</button>
                </div>

                <div id="skipLog" style="font-size:8px; color:#EF4444; margin-top:3px; min-height:12px;"></div>
                <div style="margin-top:4px; text-align:center; font-size:9px; color:#9CA3AF;">Jehy UI • V15.0</div>
            </div>
        `;

        bindEvents();
    }

    function bindEvents() {
        if (isMini) return;

        document.querySelector("#btnMini").onclick = () => {
            isMini = true;
            renderPanel();
        };

        document.querySelector("#btnStart").onclick = startProcess;

        document.querySelector("#btnPause").onclick = () => {
            isPaused = !isPaused;
            updateUIState();
        };

        document.querySelector("#btnStop").onclick = () => {
            if (confirm("🌸 DỪNG hoàn toàn?")) {
                shouldStop = true;
                isPaused = false;
            }
        };

        document.querySelector("#btnReset").onclick = () => {
            shouldStop = true;
            isRunning = false;
            isPaused = false;
            totalReportsDone = 0;
            totalLoopsCompleted = 0;
            progressPercent = 0;
            currentTaskName = "Chưa chạy";
            statusText = "Sẵn sàng";
            statusColor = "#16A34A";
            skippedSteps = [];
            stopAntiSleep();
            updateUIState();
            renderPanel();
        };

        document.querySelector("#speedRange").oninput = (e) => {
            speed = Number(e.target.value);
            updateDelays();
            document.querySelector("#speedText").innerText = (speed / 1000).toFixed(1) + "s";
        };

        document.querySelector("#chkAntiSleep").onchange = (e) => {
            antiSleepEnabled = e.target.checked;
            if (antiSleepEnabled) startAntiSleep();
            else stopAntiSleep();
        };
    }

    function updateUIState() {
        if (isMini) return;
        const btnStart = document.querySelector("#btnStart");
        const btnPause = document.querySelector("#btnPause");
        const btnStop = document.querySelector("#btnStop");
        if (!btnStart || !btnPause || !btnStop) return;

        if (isRunning) {
            btnStart.style.display = "none";
            btnPause.style.display = "block";
            btnStop.style.display = "block";
            if (isPaused) {
                btnPause.innerText = "▶️ TIẾP";
                btnPause.style.background = "linear-gradient(135deg,#3B82F6,#60A5FA)";
            } else {
                btnPause.innerText = "⏸️ DỪNG";
                btnPause.style.background = "linear-gradient(135deg,#F59E0B,#FDBA74)";
            }
        } else {
            btnStart.style.display = "block";
            btnPause.style.display = "none";
            btnStop.style.display = "none";
        }
    }

    function updateStatus(text, color = "#16A34A") {
        statusText = text;
        statusColor = color;
        if (isMini) {
            const el = document.getElementById("miniText");
            if (el) el.innerText = text;
            return;
        }
        const el = document.querySelector("#statusText");
        if (el) {
            el.innerText = text;
            el.style.color = color;
        }
    }

    function updateProgress(percent) {
        progressPercent = percent;
        if (isMini) {
            const bar = document.getElementById("miniBar");
            if (bar) bar.style.width = percent + "%";
            return;
        }
        const bar = document.querySelector("#progressBar");
        const text = document.querySelector("#progressText");
        if (bar) bar.style.width = percent + "%";
        if (text) text.innerText = percent + "%";
    }

    function updateTotalDisplay() {
        if (isMini) {
            const el = document.getElementById("miniStats");
            if (el) el.innerText = `Báo cáo: ${totalReportsDone} • Vòng: ${totalLoopsCompleted}`;
            return;
        }
        const elTotal = document.querySelector("#totalDone");
        const elLoop = document.querySelector("#loopCount");
        if (elTotal) elTotal.innerText = totalReportsDone;
        if (elLoop) elLoop.innerText = totalLoopsCompleted;
    }

    function updateCurrentType(typeName) {
        currentTaskName = typeName;
        if (isMini) return;
        const el = document.querySelector("#currentTask");
        if (el) el.innerText = typeName;
    }

    function skipStep(name) {
        if (name === "Nhập tên Meta") return;
        skippedSteps.push(name);
        if (isMini) return;
        const logEl = document.querySelector("#skipLog");
        if (logEl) logEl.innerText = `⚠ Skip: ${skippedSteps.join(', ')}`;
    }

    // ==========================================
    // THỰC HIỆN MỘT LOẠI REPORT
    // ==========================================
    async function executeReport(reportConfig) {
        const steps = reportConfig.steps;
        for (let i = 0; i < steps.length; i++) {
            if (shouldStop) return false;
            while (isPaused && !shouldStop) { await sleep(400); }
            if (shouldStop) return false;

            let step = steps[i];
            updateStatus(`[${reportConfig.name}] ${step.name}`, "#F59E0B");
            updateProgress((i / steps.length) * 100);

            if (step.optional && step.name.startsWith("Something")) {
                let found = false;
                for (let r = 0; r < SOMETHING_RETRIES; r++) {
                    let el = findButtonByKeywords(step.keywords);
                    if (el) {
                        safeClick(el);
                        await sleep(DELAY_TIME);
                        found = true;
                        break;
                    }
                    await sleep(500);
                }
                if (!found) console.log('Bỏ qua Something about - không tìm thấy.');
                continue;
            }

            if (step.special === "input") {
                let inp = getElementByXpath(INPUT_XPATH);
                if (inp) {
                    simulateInputWithTracker(inp, step.inputData);
                    await sleep(INPUT_DELAY);
                } else {
                    console.warn('Không tìm thấy ô input Meta.');
                }
                continue;
            }

            if (step.special === "meta") {
                let success = await clickMetaResult();
                if (!success) {
                    skipStep("Không tìm thấy Meta");
                    await sleep(DELAY_TIME);
                }
                continue;
            }

            if (step.special === "somethingElse") {
                for (let r = 0; r < MAX_RETRIES + 2; r++) {
                    if (shouldStop) break;
                    if (await findAndClickSomethingElse()) {
                        break;
                    }
                    window.scrollTo(0, document.body.scrollHeight);
                    await sleep(500);
                }
                await sleep(1500);
                continue;
            }

            let el = null;
            const isAction = step.action === true;
            const isMenu = step.special === "menu";
            const isDoneStep = step.done === true;

            for (let retry = 0; retry < 10; retry++) {
                if (shouldStop) break;
                if (isMenu) {
                    el = findMenuElement();
                } else if (isAction) {
                    el = findActionButton(step.keywords);
                } else {
                    if (step.keywords) el = findButtonByKeywords(step.keywords);
                    if (!el && step.xpath) el = getElementByXpath(step.xpath);
                }
                if (el) break;
                await sleep(600);
            }

            if (!el) {
                console.warn(`⚠ Không tìm thấy nút: ${step.name}`);
                skipStep(step.name);
                await sleep(DELAY_TIME);
                continue;
            }

            safeClick(el);
            if (isMenu) await sleep(800);
            else if (isDoneStep) await sleep(DONE_DELAY);
            else if (isAction) await sleep(WAIT_FOR_ACTION);
            else await sleep(DELAY_TIME);
        }
        if (shouldStop) return false;
        totalReportsDone++;
        updateTotalDisplay();
        return true;
    }

    // ==========================================
    // MAIN LOOP
    // ==========================================
    async function startProcess() {
        totalReportsDone = 0;
        totalLoopsCompleted = 0;
        skippedSteps = [];
        updateTotalDisplay();
        updateProgress(0);
        updateCurrentType("Chưa chạy");

        shouldStop = false; isPaused = false; isRunning = true;
        if (antiSleepEnabled) startAntiSleep();
        updateUIState();
        updateStatus("🚀 BẮT ĐẦU BÁO CÁO VÔ HẠN!", "#16A34A");

        let loopCount = 0;
        while (!shouldStop) {
            loopCount++;
            for (let i = 0; i < reportTypes.length && !shouldStop; i++) {
                const report = reportTypes[i];
                updateCurrentType(report.name);
                updateStatus(`📋 [Vòng ${loopCount}] ${report.name}`, "#F59E0B");
                await executeReport(report);
                if (!shouldStop) await sleep(INTER_REPORT_DELAY);
            }
            if (!shouldStop) {
                totalLoopsCompleted = loopCount;
                updateTotalDisplay();
                updateStatus(`✅ Hoàn thành vòng ${loopCount}!`, "#16A34A");
                await sleep(LOOP_DELAY);
            }
        }
        isRunning = false;
        stopAntiSleep();
        updateUIState();
        updateStatus(`✨ ĐÃ DỪNG! Tổng: ${totalReportsDone}`, "#DC2626");
        updateProgress(100);
    }

    // Khởi động
    updateDelays();
    document.body.appendChild(panel);
    renderPanel();
    if (antiSleepEnabled) startAntiSleep();
    updateStatus("🌸 Sẵn sàng! Bấm CHẠY", "#16A34A");
})();