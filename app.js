// Google Sheets連携用エンドポイント（GASデプロイURL）
// 設定方法: gas/sheets-receiver.gs をデプロイ後、URLをここに貼り付ける
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyqBq7eYVt18QJiwJITaefPZY4WZ5JqVo-C6enqDAx3R9T2xAfGOkRQ8aIhqJ1kQtsAng/exec';

// シーシャ技術診断（30問）
const shishaQuestions = [
    // Ⅰ．最重要：シーシャの土台理解（1〜8）
    {
        category: "Ⅰ. シーシャの土台理解",
        question: "シーシャで、フレーバーを過熱するのでなく、熱で温めて成分を抽出している意図を自分の言葉で説明できる",
        type: "self-eval",
        explanation: "シーシャは「燃やす」のではなく「揮発させる」ことで味を引き出します。過熱を避け、最適な温度帯を維持する理解が重要です。"
    },
    {
        category: "Ⅰ. シーシャの土台理解",
        question: "シーシャを作ってから30分後に、何が変わるか3つ以上言える",
        type: "self-eval",
        explanation: "熱のなじみ、フレーバーの味変化、キック感の減少、炭の灰化、温度の浸透など、時間経過による変化を理解することが重要です。"
    },
    {
        category: "Ⅰ. シーシャの土台理解",
        question: "香り・味・煙のうち、最初に出やすいものと遅れて出るものを区別できる",
        type: "self-eval",
        explanation: "香料→糖蜜→グリセリンの順で活性化します。それぞれの揮発タイミングを理解することで、より良い提供ができます。"
    },
    {
        category: "Ⅰ. シーシャの土台理解",
        question: "同じフレーバーで、結果が変わった具体例を1つ説明できる",
        type: "self-eval",
        explanation: "機材の変化や外的要因（気温など）で結果は変わります。再現性を持たせるには、変数を意識することが必要です。"
    },
    {
        category: "Ⅰ. シーシャの土台理解",
        question: "炭の「数」以外に、重要な要素を2つ以上言える",
        type: "self-eval",
        explanation: "炭の体積、炭の炊き方、熱気と外気のバランス、使う道具との相性など、数以外にも多くの要素があります。"
    },
    {
        category: "Ⅰ. シーシャの土台理解",
        question: "強く吸いすぎたときに、実際に起きた変化を説明できる",
        type: "self-eval",
        explanation: "強く吸うと熱中心の侵入が進み、上面と下面の剥離が発生。本来持つ時間が短縮される原因になります。"
    },
    {
        category: "Ⅰ. シーシャの土台理解",
        question: "吸う人が変わったときに、どこが変わるか具体的に言える",
        type: "self-eval",
        explanation: "吸い方には属人性があり、浅く吸う人と深く吸う人では、熱の入り方や味の出方が大きく変わります。"
    },
    {
        category: "Ⅰ. シーシャの土台理解",
        question: "その場に合わせて、作り方を変えた経験を説明できる",
        type: "self-eval",
        explanation: "お客さまの好みや趣向に合わせてカスタマイズすることで、より高い満足度を提供できます。"
    },
    // Ⅱ．熱と炭の扱い（9〜15）
    {
        category: "Ⅱ. 熱と炭の扱い",
        question: "炭の数を変えた理由を、結果とセットで説明できる",
        type: "self-eval",
        explanation: "炭が多いと熱中心の侵入で上面が活性化、少ないと外気優位で活性化温度に到達しないなど、結果が大きく変わります。"
    },
    {
        category: "Ⅱ. 熱と炭の扱い",
        question: "炭を中央寄り／外側寄りに置く理由を説明できる",
        type: "self-eval",
        explanation: "炭の配置は熱の入り方を左右します。中央は強い熱、外側は緩やかな熱になります。"
    },
    {
        category: "Ⅱ. 熱と炭の扱い",
        question: "炭を動かさずに失敗した経験を説明できる",
        type: "self-eval",
        explanation: "炭を動かさないと一部だけ過熱し、フレーバーが焦げる原因になります。定期的な調整が必要です。"
    },
    {
        category: "Ⅱ. 熱と炭の扱い",
        question: "吸い始めと30分後で、炭の役割がどう変わるか説明できる",
        type: "self-eval",
        explanation: "炭替え前後で熱量が大きく変化します。炭替え直後は熱が急上昇し、中層〜下層が活性化します。"
    },
    {
        category: "Ⅱ. 熱と炭の扱い",
        question: "炭替えを「いつ・なぜ」行うか説明できる",
        type: "self-eval",
        explanation: "炭が半分程度灰化したタイミングで、熱量維持のために行います。単なる熱源補充ではなく、味の変化も伴います。"
    },
    {
        category: "Ⅱ. 熱と炭の扱い",
        question: "熱が強すぎたと判断した具体的なサインを2つ言える",
        type: "self-eval",
        explanation: "えぐみが出る、煙が焦げ臭い、むせる、味が飛ぶなどのサインがあります。"
    },
    {
        category: "Ⅱ. 熱と炭の扱い",
        question: "熱が弱すぎたと判断した具体的なサインを2つ言える",
        type: "self-eval",
        explanation: "煙が薄い、味が出ない、吸い心地が軽すぎるなどのサインがあります。"
    },
    // Ⅲ．吸い方・人の影響（16〜21）
    {
        category: "Ⅲ. 吸い方・人の影響",
        question: "吸う強さ・間隔が、熱にどう影響するか説明できる",
        type: "self-eval",
        explanation: "強く吸うと空気が流れて熱が上がり、間隔が長いと熱が下がります。吸い方は熱管理の重要な変数です。"
    },
    {
        category: "Ⅲ. 吸い方・人の影響",
        question: "吸いすぎて崩れた経験を、原因込みで説明できる",
        type: "self-eval",
        explanation: "連続して強く吸うと熱が過剰になり、フレーバーが焦げたり、味が崩れる原因になります。"
    },
    {
        category: "Ⅲ. 吸い方・人の影響",
        question: "吸われなさすぎて崩れた経験を説明できる",
        type: "self-eval",
        explanation: "吸わない時間が長いと熱が逃げ、フレーバーが十分に活性化せず味が出なくなります。"
    },
    {
        category: "Ⅲ. 吸い方・人の影響",
        question: "複数人で吸ったときの変化を説明できる",
        type: "self-eval",
        explanation: "複数人で回し吸いすると、熱の入り方が変わり、通常より早く味が変化することがあります。"
    },
    {
        category: "Ⅲ. 吸い方・人の影響",
        question: "自分の吸い方の特徴を言葉で説明できる",
        type: "self-eval",
        explanation: "自分の吸い方を客観視することで、お客さまへのアドバイスや調整がより的確になります。"
    },
    {
        category: "Ⅲ. 吸い方・人の影響",
        question: "お客さんに合わせて、吸い方のアドバイスを変えたことがある",
        type: "self-eval",
        explanation: "初心者にはゆっくり、経験者には自由にといった、相手に合わせたアドバイスができることが重要です。"
    },
    // Ⅳ．道具・環境の理解（22〜26）
    {
        category: "Ⅳ. 道具・環境の理解",
        question: "パイプの違いで起きる変化を説明できる",
        type: "self-eval",
        explanation: "パイプの長さ、太さ、素材、ディフューザーの有無などで、煙の冷却度合いや吸い心地が変わります。"
    },
    {
        category: "Ⅳ. 道具・環境の理解",
        question: "アルミのみ／HMD使用時の違いを説明できる",
        type: "self-eval",
        explanation: "アルミは細かい調整が可能で職人技が出る。HMDは安定性重視で効率的。場面に応じた使い分けが有効です。"
    },
    {
        category: "Ⅳ. 道具・環境の理解",
        question: "水量を変えた理由と結果を説明できる",
        type: "self-eval",
        explanation: "水量は煙の冷却とフィルタリングに影響。多いと冷たくまろやか、少ないと軽い吸い心地になります。"
    },
    {
        category: "Ⅳ. 道具・環境の理解",
        question: "気温・湿度で調整した経験を説明できる",
        type: "self-eval",
        explanation: "冬は水温が下がり煙が冷却されやすく、夏は揮発しやすい。季節に応じた調整が品質安定に繋がります。"
    },
    {
        category: "Ⅳ. 道具・環境の理解",
        question: "同じレシピで失敗した理由を説明できる",
        type: "self-eval",
        explanation: "外部環境（気温、湿度、フレーバーの状態など）の変化により、同じレシピでも結果は変わります。"
    },
    // Ⅴ．学習・復旧能力（27〜30）
    {
        category: "Ⅴ. 学習・復旧能力",
        question: "失敗したシーシャを、どこから直すか説明できる",
        type: "self-eval",
        explanation: "原因特定→対処の順序を理解し、熱なのか、盛り方なのか、炭の配置なのかを判断できることが重要です。"
    },
    {
        category: "Ⅴ. 学習・復旧能力",
        question: "一度崩れた状態から、戻した経験を説明できる",
        type: "self-eval",
        explanation: "リカバリーの経験があると、繁忙時でも落ち着いて対応できます。"
    },
    {
        category: "Ⅴ. 学習・復旧能力",
        question: "他人の失敗を見て、原因を推測したことがある",
        type: "self-eval",
        explanation: "他者の失敗から学ぶ姿勢があると、自分では経験しない失敗パターンも理解できます。"
    },
    {
        category: "Ⅴ. 学習・復旧能力",
        question: "自分の作り方の弱点を1つ言える",
        type: "self-eval",
        explanation: "自己認識ができていると、改善の方向性が明確になり、成長が加速します。"
    }
];

// 経営知識診断（25問）
const businessQuestions = [
    // 経営感覚・基本概念（1〜5）
    {
        category: "経営感覚・基本概念",
        question: "売上高とは、自店が「売り上げた金額の合計」のことである。",
        answer: false,
        explanation: "お客さまが「買い上げた金額の合計」が正しい定義です。視点の違いが重要です。"
    },
    {
        category: "経営感覚・基本概念",
        question: "飲食店の売上高は「客数 × 客単価」で計算できる。",
        answer: true,
        explanation: "売上高=客数×客単価は経営の基本公式です。売上を伸ばすには「客数を増やす」か「客単価を上げる」かの方向性が見えます。"
    },
    {
        category: "経営感覚・基本概念",
        question: "経営の三種の神器は「人」→「物」→「金」の順番で重要である。",
        answer: false,
        explanation: "「金」→「人」→「物」→売り方の順が正しいです。資金がなければ人も物も揃えられません。"
    },
    {
        category: "経営感覚・基本概念",
        question: "売上高はオーナー・店長（TOP）にしか作れない。",
        answer: true,
        explanation: "TOPである経営者こそが、戦略を立て、仕組みを作り、売上を生み出す源泉となります。"
    },
    {
        category: "経営感覚・基本概念",
        question: "客足が減ったら、まずチラシ配布やSNS広告を強化すべきである。",
        answer: false,
        explanation: "広告の前に、来店が減った原因を特定して解決すべきです。広告・販促は自店の良さを知らしめる行為です。"
    },
    // 生存対策・経営構図（6〜10）
    {
        category: "生存対策・経営構図",
        question: "経営とは、継続した「投資」と「回収」のしくみと活動のことである。",
        answer: true,
        explanation: "経営の本質は投資と回収のサイクルを継続的に回すことです。"
    },
    {
        category: "生存対策・経営構図",
        question: "飲食店の生存条件の一つは「荒利益高≧経費」である。",
        answer: true,
        explanation: "荒利益が経費を下回ると赤字になり、事業継続が困難になります。"
    },
    {
        category: "生存対策・経営構図",
        question: "売上高を上げることは、荒利益を確保し利益を上げるための「目的」である。",
        answer: false,
        explanation: "売上は「手段」です。真の目的は適正な利益を確保し、事業を継続・発展させることです。"
    },
    {
        category: "生存対策・経営構図",
        question: "荒利益高は「売上高－売上原価（食材原価）」で計算できる。",
        answer: true,
        explanation: "荒利益高=売上高-原価で計算されます。これが経費を上回る必要があります。"
    },
    {
        category: "生存対策・経営構図",
        question: "人件費や家賃などの分配率を守らないと、飲食店は確実に崩壊する。",
        answer: true,
        explanation: "分配率は経営の生命線です。FL比率（Food+Labor）の管理が特に重要です。"
    },
    // 顧客対応（11〜15）
    {
        category: "顧客対応",
        question: "「お客さまのために」とは、朝礼で唱和する心構えのことである。",
        answer: false,
        explanation: "心構えではなく、行動の仕方と、実現している状態のことです。「思っている」だけでは不十分です。"
    },
    {
        category: "顧客対応",
        question: "飲食店において「料理（商品）」こそがお客さま満足の本命策である。",
        answer: true,
        explanation: "接客やサービスも大切ですが、お客様は商品を求めて来店されます。商品力が最優先です。"
    },
    {
        category: "顧客対応",
        question: "お客さまが店に求める要素として「安さ」「豊富さ」「速さ」「便利さ」「清潔さ」がある。",
        answer: true,
        explanation: "これらは顧客が店舗に求める基本的な価値要素です。"
    },
    {
        category: "顧客対応",
        question: "料理の品質に必要なのは「最高の品質」よりも「価格に見合った必要な品質」である。",
        answer: true,
        explanation: "過剰品質はコストを圧迫します。価格に見合った適正品質を提供することが重要です。"
    },
    {
        category: "顧客対応",
        question: "「お客さまのために」とは、「作る立場」「売る立場」で考えることである。",
        answer: false,
        explanation: "「食べる立場」「買う立場」に視点を変更することが正しい考え方です。"
    },
    // 経営戦略・市場対応（16〜19）
    {
        category: "経営戦略・市場対応",
        question: "小規模飲食店に最初から必要なのは「差別化」であり、繁盛店の「真似」をすべきではない。",
        answer: false,
        explanation: "最初は差別化できる体力をつけるために「真似（＝経験主義）」をすべきです。"
    },
    {
        category: "経営戦略・市場対応",
        question: "「オンリーワン」の店になることは、「ナンバーワン」になるための手段である。",
        answer: true,
        explanation: "ある分野でナンバーワンになるための戦略的選択がオンリーワンです。"
    },
    {
        category: "経営戦略・市場対応",
        question: "現代の飲食店では「多メニュー・少量販売」から「限定メニュー・多量販売」への転換が求められる。",
        answer: true,
        explanation: "メニューを絞り込み、得意分野に集中することで効率と品質を高められます。"
    },
    {
        category: "経営戦略・市場対応",
        question: "飲食店経営における重要な判断は「精神力」や「根性」だけで行うべきである。",
        answer: false,
        explanation: "「精神」と「論理」の両立が必要です。決断は「知識」であり、精神・根性だけではありません。"
    },
    // メニュー政策・商品管理（20〜22）
    {
        category: "メニュー政策・商品管理",
        question: "飲食店で利益が出ない場合、まず取り組むべきは「売上高の増大」である。",
        answer: false,
        explanation: "売れない時代においては、まず「コスト削減」から取り組むべきです。"
    },
    {
        category: "メニュー政策・商品管理",
        question: "プライスラインの数は多ければ多いほど良い。",
        answer: false,
        explanation: "通常は3〜5ライン、最大でも7ラインが適正です。安くて1ラインが最も強い。"
    },
    {
        category: "メニュー政策・商品管理",
        question: "飲食店のビジネス手法は、同一メニューをより多くの客に売る「マーケティング」である。",
        answer: false,
        explanation: "同一の客に総予算の範囲でより多くの料理・ドリンクを提供する「マーチャンダイジング」が重要です。"
    },
    // 計数管理（23〜25）
    {
        category: "計数管理",
        question: "ABC分析とは、売れ筋メニューに管理の主力を注ぐ「重点管理」の手法である。",
        answer: true,
        explanation: "売上貢献度でA・B・Cにランク分けし、重点的に管理する手法です。"
    },
    {
        category: "計数管理",
        question: "実地棚卸しをしないと、正確な荒利益高がわからず「経営」ができなくなる。",
        answer: true,
        explanation: "棚卸しなしでは原価が正確に把握できず、利益計算ができません。"
    },
    {
        category: "計数管理",
        question: "労働生産性の公式は「売上高÷従業者数」である。",
        answer: false,
        explanation: "「荒利益高÷従業者数」が正しい公式です。生産性は単位当り獲得荒利益高のことです。"
    }
];

// 状態管理
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let categoryScores = {};
let quizType = '';
let shishaScore = { correct: 0, total: 0 };
let businessScore = { correct: 0, total: 0 };
let selectedAnswer = null; // 現在選択中の回答
let userExplanations = []; // ユーザーの説明を保存
let answerRecords = []; // 各問の回答記録

// タイマー関連
let timerInterval = null;
let timeLeft = 0;
let maxTime = 0;
let isExplanationPhase = false;
const TIME_SELF_EVAL = 20;  // 自己評価問題：20秒
const TIME_TRUE_FALSE = 15; // ○×問題：15秒
const TIME_EXPLANATION = 60; // 説明入力：60秒

// タブ離脱カウント
let tabLeaveCount = 0;

// タブ離脱検知（問題をぼかす + オーバーレイ表示）
document.addEventListener('visibilitychange', function() {
    const quizScreen = document.getElementById('quizScreen');
    const overlay = document.getElementById('screenshotOverlay');

    if (quizScreen.style.display === 'block') {
        if (document.hidden) {
            // 離脱時：問題をぼかす + オーバーレイ表示
            tabLeaveCount++;
            quizScreen.classList.add('blurred');
            overlay.classList.add('show');

            const warning = document.getElementById('tabWarning');
            const countEl = document.getElementById('tabWarningCount');
            countEl.textContent = `離脱回数: ${tabLeaveCount}回`;
            warning.style.display = 'block';
        } else {
            // 復帰時：ぼかし解除 + オーバーレイ非表示
            quizScreen.classList.remove('blurred');
            overlay.classList.remove('show');

            setTimeout(() => {
                document.getElementById('tabWarning').style.display = 'none';
            }, 3000);
        }
    }
});

// 画面録画検知（対応ブラウザのみ）
if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    // Screen Capture API の検知を試みる
    const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
    navigator.mediaDevices.getDisplayMedia = function() {
        console.warn('画面録画が検知されました');
        return originalGetDisplayMedia.apply(this, arguments);
    };
}

// ページ離脱時（blur）にも問題を隠す（スマホでスクショ撮る際の対策）
window.addEventListener('blur', function() {
    const quizScreen = document.getElementById('quizScreen');
    const overlay = document.getElementById('screenshotOverlay');

    if (quizScreen.style.display === 'block') {
        quizScreen.classList.add('blurred');
        overlay.classList.add('show');
    }
});

window.addEventListener('focus', function() {
    const quizScreen = document.getElementById('quizScreen');
    const overlay = document.getElementById('screenshotOverlay');

    quizScreen.classList.remove('blurred');
    overlay.classList.remove('show');
});

// タッチ長押し防止（スマホでのスクショメニュー抑止）
document.addEventListener('touchstart', function(e) {
    if (document.getElementById('quizScreen').style.display === 'block') {
        if (e.target.id !== 'userExplanation') {
            // 長押しを無効化
            e.target.style.webkitTouchCallout = 'none';
        }
    }
}, { passive: true });

// コピー防止（追加対策）
document.addEventListener('keydown', function(e) {
    if (document.getElementById('quizScreen').style.display === 'block') {
        // Ctrl+C, Ctrl+X, Ctrl+A を無効化（説明入力欄以外）
        if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a'].includes(e.key.toLowerCase())) {
            if (document.activeElement.id !== 'userExplanation') {
                e.preventDefault();
            }
        }
    }
});

// クイズ開始
function startQuiz(type) {
    quizType = type;

    // シーシャ問題にquizTypeを付与
    const shishaWithType = shishaQuestions.map(q => ({...q, quizType: 'shisha'}));
    // 経営問題にquizTypeを付与
    const businessWithType = businessQuestions.map(q => ({...q, quizType: 'business'}));

    // 全問題を結合（シーシャ→経営の順、シャッフルなし）
    currentQuestions = [...shishaWithType, ...businessWithType];

    currentIndex = 0;
    score = 0;
    categoryScores = {};
    shishaScore = { correct: 0, total: 0 };
    businessScore = { correct: 0, total: 0 };
    userExplanations = [];
    answerRecords = [];

    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';
    document.getElementById('resultScreen').style.display = 'none';
    tabLeaveCount = 0;

    showQuestion();
}

// タイマー開始
function startTimer(seconds) {
    stopTimer();
    timeLeft = seconds;
    maxTime = seconds;
    isExplanationPhase = false;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            stopTimer();
            handleTimeUp();
        }
    }, 1000);
}

// 説明入力用タイマー開始
function startExplanationTimer() {
    stopTimer();
    timeLeft = TIME_EXPLANATION;
    maxTime = TIME_EXPLANATION;
    isExplanationPhase = true;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            stopTimer();
            // 時間切れでも入力された分は保存して次へ
            submitExplanation(true);
        }
    }, 1000);
}

// タイマー停止
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// タイマー表示更新
function updateTimerDisplay() {
    const timerEl = document.getElementById('timerDisplay');
    const timerBarFill = document.getElementById('timerBarFill');
    const percent = (timeLeft / maxTime) * 100;

    timerEl.textContent = timeLeft;
    timerBarFill.style.width = percent + '%';

    // 色の変更
    timerEl.className = 'timer';
    timerBarFill.className = 'timer-bar-fill';

    if (timeLeft <= 5) {
        timerEl.classList.add('danger');
        timerBarFill.classList.add('danger');
    } else if (timeLeft <= 10) {
        timerEl.classList.add('warning');
        timerBarFill.classList.add('warning');
    }
}

// 時間切れ処理
function handleTimeUp() {
    const q = currentQuestions[currentIndex];
    const btnCorrect = document.getElementById('btnCorrect');
    const btnWrong = document.getElementById('btnWrong');
    const feedback = document.getElementById('feedback');

    // ボタンを無効化
    btnCorrect.disabled = true;
    btnWrong.disabled = true;

    // 未回答として処理（不正解扱い）
    answerRecords[currentIndex] = {
        index: currentIndex + 1,
        quizType: q.quizType === 'shisha' ? 'シーシャ技術' : '経営知識',
        category: q.category,
        question: q.question,
        answer: '時間切れ',
        correct: false,
        modelAnswer: q.explanation
    };

    // シーシャ/経営別スコア
    if (q.quizType === 'shisha') {
        shishaScore.total++;
    } else {
        businessScore.total++;
    }

    // カテゴリ別スコア
    if (!categoryScores[q.category]) {
        categoryScores[q.category] = { correct: 0, total: 0 };
    }
    categoryScores[q.category].total++;

    // フィードバック表示
    feedback.style.display = 'block';
    feedback.className = 'feedback wrong';
    document.getElementById('feedbackTitle').textContent = '⏱️ 時間切れ！';
    document.getElementById('feedbackText').textContent = q.explanation;

    // 確定ボタン非表示、次へボタン表示
    document.getElementById('confirmBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'block';
    document.getElementById('nextBtn').textContent =
        currentIndex === currentQuestions.length - 1 ? '結果を見る' : '次の問題へ';
}

// 配列シャッフル
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 問題表示
function showQuestion() {
    const q = currentQuestions[currentIndex];

    // プログレスバー更新
    const progress = ((currentIndex) / currentQuestions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';

    // 問題番号
    document.getElementById('questionNumber').textContent =
        `問${currentIndex + 1} / ${currentQuestions.length}`;

    // カテゴリ
    document.getElementById('categoryBadge').textContent = q.category;

    // 問題文
    document.getElementById('questionText').textContent = q.question;

    // 自己評価モードの表示
    if (q.type === 'self-eval') {
        document.getElementById('selfEvalNote').style.display = 'block';
        document.getElementById('btnCorrect').textContent = '○ できる';
        document.getElementById('btnWrong').textContent = '× できない';
    } else {
        document.getElementById('selfEvalNote').style.display = 'none';
        document.getElementById('btnCorrect').textContent = '○';
        document.getElementById('btnWrong').textContent = '×';
    }

    // ボタンリセット
    const btnCorrect = document.getElementById('btnCorrect');
    const btnWrong = document.getElementById('btnWrong');
    btnCorrect.disabled = false;
    btnWrong.disabled = false;
    btnCorrect.className = 'answer-btn correct-btn';
    btnWrong.className = 'answer-btn wrong-btn';

    // 選択状態リセット
    selectedAnswer = null;

    // フィードバック・ボタン非表示
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('confirmBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('submitExplanationBtn').style.display = 'none';
    document.getElementById('explanationInput').style.display = 'none';
    document.getElementById('userExplanationDisplay').style.display = 'none';
    document.getElementById('userExplanation').value = '';

    // タイマー開始
    const timerSeconds = q.type === 'self-eval' ? TIME_SELF_EVAL : TIME_TRUE_FALSE;
    startTimer(timerSeconds);
}

// 回答選択
function answer(userAnswer) {
    const q = currentQuestions[currentIndex];
    const btnCorrect = document.getElementById('btnCorrect');
    const btnWrong = document.getElementById('btnWrong');
    const feedback = document.getElementById('feedback');

    // 選択状態を保存
    selectedAnswer = userAnswer;

    // ボタンのスタイルをリセット → 選択中を強調
    btnCorrect.className = 'answer-btn correct-btn';
    btnWrong.className = 'answer-btn wrong-btn';
    if (userAnswer) {
        btnCorrect.classList.add('selected');
    } else {
        btnWrong.classList.add('selected');
    }

    // 問1〜8で「○ できる」を選んだ場合：説明入力シートを即表示
    if (currentIndex < 8 && userAnswer === true) {
        // 説明入力シートを開く（ボタンは有効のまま＝選択変更可）
        document.getElementById('explanationInput').style.display = 'block';
        document.getElementById('explanationLabel').textContent =
            '自分の言葉で説明してください';
        document.getElementById('submitExplanationBtn').style.display = 'block';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('confirmBtn').style.display = 'none';
        document.getElementById('feedback').style.display = 'none';

        // 説明入力用タイマー開始（まだ回答は確定していない）
        startExplanationTimer();
        return;
    }

    // それ以外：選択中表示のみ、確定ボタンを出す
    feedback.style.display = 'block';
    feedback.className = 'feedback info';
    if (q.type === 'self-eval') {
        document.getElementById('feedbackTitle').textContent =
            userAnswer ? '○ できる を選択中' : '× できない を選択中';
    } else {
        document.getElementById('feedbackTitle').textContent =
            userAnswer ? '○ を選択中' : '× を選択中';
    }
    document.getElementById('feedbackText').textContent = '変更する場合は別のボタンを押してください';

    document.getElementById('confirmBtn').style.display = 'block';
    document.getElementById('nextBtn').style.display = 'none';
    // 説明入力シートが開いていれば閉じ、通常タイマーに戻す
    if (document.getElementById('explanationInput').style.display !== 'none') {
        document.getElementById('explanationInput').style.display = 'none';
        document.getElementById('submitExplanationBtn').style.display = 'none';
        document.getElementById('userExplanation').value = '';
        const timerSeconds = q.type === 'self-eval' ? TIME_SELF_EVAL : TIME_TRUE_FALSE;
        startTimer(timerSeconds);
    }
}

// 回答を確定（説明入力フェーズ以外のルート）
function confirmAnswer() {
    if (selectedAnswer === null) {
        alert('回答を選択してください');
        return;
    }
    stopTimer();
    _finalizeAnswer();
}

// 回答確定の共通処理
function _finalizeAnswer() {
    const q = currentQuestions[currentIndex];
    const btnCorrect = document.getElementById('btnCorrect');
    const btnWrong = document.getElementById('btnWrong');
    const feedback = document.getElementById('feedback');

    // ボタンを無効化
    btnCorrect.disabled = true;
    btnWrong.disabled = true;

    // スコア計算
    let isCorrect;
    if (q.type === 'self-eval') {
        isCorrect = selectedAnswer;
    } else {
        isCorrect = (selectedAnswer === q.answer);
    }
    if (isCorrect) score++;

    // 回答記録を保存
    answerRecords[currentIndex] = {
        index: currentIndex + 1,
        quizType: q.quizType === 'shisha' ? 'シーシャ技術' : '経営知識',
        category: q.category,
        question: q.question,
        answer: selectedAnswer,
        correct: isCorrect,
        modelAnswer: q.explanation
    };

    // シーシャ/経営別スコア
    if (q.quizType === 'shisha') {
        shishaScore.total++;
        if (isCorrect) shishaScore.correct++;
    } else {
        businessScore.total++;
        if (isCorrect) businessScore.correct++;
    }

    // カテゴリ別スコア
    if (!categoryScores[q.category]) {
        categoryScores[q.category] = { correct: 0, total: 0 };
    }
    categoryScores[q.category].total++;
    if (isCorrect) categoryScores[q.category].correct++;

    document.getElementById('confirmBtn').style.display = 'none';

    // フィードバック表示
    if (q.type === 'self-eval') {
        feedback.className = 'feedback ' + (selectedAnswer ? 'correct' : 'wrong');
        document.getElementById('feedbackTitle').textContent =
            selectedAnswer ? '○ できる' : '× できない';
    } else {
        feedback.className = 'feedback ' + (isCorrect ? 'correct' : 'wrong');
        document.getElementById('feedbackTitle').textContent =
            isCorrect ? '正解！' : '不正解（正解は ' + (q.answer ? '○' : '×') + '）';
    }
    document.getElementById('feedbackText').textContent = q.explanation;
    feedback.style.display = 'block';

    // 次へボタン表示
    document.getElementById('nextBtn').style.display = 'block';
    document.getElementById('nextBtn').textContent =
        currentIndex === currentQuestions.length - 1 ? '結果を見る' : '次の問題へ';
}

// 説明を送信
function submitExplanation(isTimeUp = false) {
    const userExplanation = document.getElementById('userExplanation').value.trim();

    if (!userExplanation && !isTimeUp) {
        alert('説明を入力してください');
        return;
    }

    // タイマー停止
    stopTimer();

    const q = currentQuestions[currentIndex];

    // ユーザーの説明を保存
    userExplanations[currentIndex] = userExplanation || '（未入力）';
    if (answerRecords[currentIndex]) {
        answerRecords[currentIndex].userExplanation = userExplanation || '（未入力）';
    }

    // 入力フォームを非表示
    document.getElementById('explanationInput').style.display = 'none';
    document.getElementById('submitExplanationBtn').style.display = 'none';

    // 回答を確定してスコアを記録してから次の問題へ
    _finalizeAnswer();
    document.getElementById('nextBtn').style.display = 'none';
    nextQuestion();
}

// 次の問題へ進む
function nextQuestion() {
    // タイマー停止
    stopTimer();

    // 選択をリセット
    selectedAnswer = null;

    // 次へ進む
    currentIndex++;

    if (currentIndex >= currentQuestions.length) {
        showResult();
    } else {
        showQuestion();
    }
}

// グレード判定関数
function getGrade(percent) {
    if (percent >= 90) return { grade: 'A', label: 'トップクラス', class: 'grade-a' };
    if (percent >= 70) return { grade: 'B', label: '基礎は固まっている', class: 'grade-b' };
    if (percent >= 50) return { grade: 'C', label: '改善の余地あり', class: 'grade-c' };
    return { grade: 'D', label: '基礎から強化が必要', class: 'grade-d' };
}

// 結果表示
function showResult() {
    stopTimer();
    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'block';

    const total = currentQuestions.length;
    const percent = Math.round((score / total) * 100);

    // 総合スコア表示
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalTotal').textContent = `/ ${total}問`;

    // スコアサークル
    document.getElementById('scoreCircle').style.setProperty('--score-percent', percent + '%');

    // 総合グレード判定
    const totalGrade = getGrade(percent);
    document.getElementById('grade').textContent = totalGrade.grade;
    document.getElementById('gradeLabel').textContent = totalGrade.label;

    // シーシャスコア表示
    const shishaPercent = Math.round((shishaScore.correct / shishaScore.total) * 100);
    const shishaGradeInfo = getGrade(shishaPercent);
    document.getElementById('shishaScore').textContent = `${shishaScore.correct}/${shishaScore.total}`;
    document.getElementById('shishaPercent').textContent = `${shishaPercent}%`;
    const shishaGradeEl = document.getElementById('shishaGrade');
    shishaGradeEl.textContent = shishaGradeInfo.grade;
    shishaGradeEl.className = 'main-score-grade ' + shishaGradeInfo.class;

    // 経営スコア表示
    const businessPercent = Math.round((businessScore.correct / businessScore.total) * 100);
    const businessGradeInfo = getGrade(businessPercent);
    document.getElementById('businessScore').textContent = `${businessScore.correct}/${businessScore.total}`;
    document.getElementById('businessPercent').textContent = `${businessPercent}%`;
    const businessGradeEl = document.getElementById('businessGrade');
    businessGradeEl.textContent = businessGradeInfo.grade;
    businessGradeEl.className = 'main-score-grade ' + businessGradeInfo.class;

    // カテゴリ別スコア
    const categoryList = document.getElementById('categoryScoreList');
    categoryList.innerHTML = '';

    // シーシャカテゴリを先に表示
    const shishaCategories = Object.entries(categoryScores).filter(([cat]) => cat.startsWith('Ⅰ') || cat.startsWith('Ⅱ') || cat.startsWith('Ⅲ') || cat.startsWith('Ⅳ') || cat.startsWith('Ⅴ'));
    const businessCategories = Object.entries(categoryScores).filter(([cat]) => !cat.startsWith('Ⅰ') && !cat.startsWith('Ⅱ') && !cat.startsWith('Ⅲ') && !cat.startsWith('Ⅳ') && !cat.startsWith('Ⅴ'));

    // シーシャカテゴリ
    if (shishaCategories.length > 0) {
        const shishaHeader = document.createElement('div');
        shishaHeader.className = 'category-header';
        shishaHeader.innerHTML = '<strong>【シーシャ技術】</strong>';
        shishaHeader.style.marginTop = '10px';
        shishaHeader.style.marginBottom = '5px';
        shishaHeader.style.color = '#3498db';
        categoryList.appendChild(shishaHeader);

        for (const [category, data] of shishaCategories) {
            const item = document.createElement('div');
            item.className = 'category-score-item';
            const catPercent = Math.round((data.correct / data.total) * 100);
            item.innerHTML = `
                <span class="name">${category}</span>
                <span class="score">${data.correct}/${data.total} (${catPercent}%)</span>
            `;
            categoryList.appendChild(item);
        }
    }

    // 経営カテゴリ
    if (businessCategories.length > 0) {
        const businessHeader = document.createElement('div');
        businessHeader.className = 'category-header';
        businessHeader.innerHTML = '<strong>【経営知識】</strong>';
        businessHeader.style.marginTop = '15px';
        businessHeader.style.marginBottom = '5px';
        businessHeader.style.color = '#27ae60';
        categoryList.appendChild(businessHeader);

        for (const [category, data] of businessCategories) {
            const item = document.createElement('div');
            item.className = 'category-score-item';
            const catPercent = Math.round((data.correct / data.total) * 100);
            item.innerHTML = `
                <span class="name">${category}</span>
                <span class="score">${data.correct}/${data.total} (${catPercent}%)</span>
            `;
            categoryList.appendChild(item);
        }
    }

    // Google Sheetsへ自動送信
    submitToSheets();
}

// Google Sheets送信
function submitToSheets() {
    if (!GAS_ENDPOINT) return;

    const data = buildExportData();
    fetch(GAS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).catch(function() {
        // 送信失敗は静かに無視（オフライン等）
    });
}

// エクスポートデータを構築
function buildExportData() {
    const now = new Date();
    const timestamp = now.toISOString();
    const shishaPercent = Math.round((shishaScore.correct / shishaScore.total) * 100);
    const businessPercent = Math.round((businessScore.correct / businessScore.total) * 100);
    const totalPercent = Math.round((score / currentQuestions.length) * 100);

    return {
        meta: {
            exportedAt: timestamp,
            totalScore: score + '/' + currentQuestions.length,
            totalPercent: totalPercent + '%',
            totalGrade: getGrade(totalPercent).grade,
            shishaScore: shishaScore.correct + '/' + shishaScore.total,
            shishaPercent: shishaPercent + '%',
            shishaGrade: getGrade(shishaPercent).grade,
            businessScore: businessScore.correct + '/' + businessScore.total,
            businessPercent: businessPercent + '%',
            businessGrade: getGrade(businessPercent).grade,
            tabLeaveCount: tabLeaveCount
        },
        categories: Object.fromEntries(
            Object.entries(categoryScores).map(([cat, data]) => [
                cat,
                { correct: data.correct, total: data.total, percent: Math.round((data.correct / data.total) * 100) + '%' }
            ])
        ),
        answers: answerRecords.filter(Boolean)
    };
}

// CSVエクスポート
function exportCSV() {
    const data = buildExportData();
    const headers = ['No', '分類', 'カテゴリ', '問題', '回答', '正誤', '自由記述', '模範解答'];
    const rows = data.answers.map(r => [
        r.index,
        r.quizType,
        r.category,
        '"' + r.question.replace(/"/g, '""') + '"',
        r.answer === true ? '○' : (r.answer === false ? '×' : r.answer),
        r.correct ? '正解' : '不正解',
        '"' + (r.userExplanation || '').replace(/"/g, '""') + '"',
        '"' + r.modelAnswer.replace(/"/g, '""') + '"'
    ]);

    const summary = [
        ['診断日時', data.meta.exportedAt],
        ['総合スコア', data.meta.totalScore + ' (' + data.meta.totalPercent + ') グレード: ' + data.meta.totalGrade],
        ['シーシャ技術', data.meta.shishaScore + ' (' + data.meta.shishaPercent + ') グレード: ' + data.meta.shishaGrade],
        ['経営知識', data.meta.businessScore + ' (' + data.meta.businessPercent + ') グレード: ' + data.meta.businessGrade],
        ['タブ離脱回数', data.meta.tabLeaveCount],
        [],
        headers
    ];

    const csvContent = summary.concat(rows).map(r => r.join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'MYT_診断結果_' + formatDate(new Date()) + '.csv');
}

// JSONエクスポート
function exportJSON() {
    const data = buildExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
    downloadBlob(blob, 'MYT_診断結果_' + formatDate(new Date()) + '.json');
}

// ダウンロードヘルパー
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 日付フォーマットヘルパー
function formatDate(d) {
    return d.getFullYear() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0') + '_' +
        String(d.getHours()).padStart(2, '0') +
        String(d.getMinutes()).padStart(2, '0');
}

// 再スタート
function restart() {
    stopTimer();
    tabLeaveCount = 0;
    document.getElementById('tabWarning').style.display = 'none';
    startQuiz('all');
}
