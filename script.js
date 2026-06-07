// ================================
// CBT SKB IPS SMP
// ================================

let questions = [];
let currentQuestion = 0;
let userAnswers = [];
let flaggedQuestions = [];

let participantName = "";
let examDuration = 90 * 60; // 90 menit

// ================================
// ELEMENTS
// ================================

const loginPage = document.getElementById("login-page");
const examPage = document.getElementById("exam-page");
const resultPage = document.getElementById("result-page");

const loginForm = document.getElementById("loginForm");

const displayNama = document.getElementById("displayNama");

const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");

const questionCounter = document.getElementById("questionCounter");
const questionNumbers = document.getElementById("questionNumbers");

const progressFill = document.getElementById("progressFill");

const timerElement = document.getElementById("timer");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const flagBtn = document.getElementById("flagBtn");
const finishBtn = document.getElementById("finishBtn");

const finishModal = document.getElementById("finishModal");
const confirmFinish = document.getElementById("confirmFinish");
const cancelFinish = document.getElementById("cancelFinish");

// ================================
// LOAD SOAL
// ================================

fetch("soal.json")
    .then(response => response.json())
    .then(data => {

        questions = shuffleArray(data);

        questions.forEach(q => {
            shuffleOptions(q);
        });

    })
    .catch(error => {
        console.error(error);
        alert("Gagal memuat soal!");
    });

// ================================
// LOGIN
// ================================

loginForm.addEventListener("submit", function(e){

    e.preventDefault();

    participantName =
        document.getElementById("namaPeserta").value.trim();

    if(participantName === ""){
        alert("Masukkan nama peserta!");
        return;
    }

    displayNama.textContent = participantName;

    loginPage.classList.add("hidden");
    examPage.classList.remove("hidden");

    createQuestionNumbers();
    loadQuestion();

    startTimer();

});

// ================================
// SHUFFLE ARRAY
// ================================

function shuffleArray(array){

    for(let i = array.length - 1; i > 0; i--){

        let j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
        [array[j], array[i]];

    }

    return array;
}

// ================================
// SHUFFLE OPTIONS
// ================================

function shuffleOptions(question){

    let correctAnswer =
        question.options[question.answer];

    question.options =
        shuffleArray([...question.options]);

    question.answer =
        question.options.indexOf(correctAnswer);
}

// ================================
// NOMOR SOAL
// ================================

function createQuestionNumbers(){

    questionNumbers.innerHTML = "";

    questions.forEach((q,index)=>{

        const btn =
            document.createElement("button");

        btn.className = "question-number";

        btn.textContent = index + 1;

        btn.addEventListener("click", ()=>{

            currentQuestion = index;
            loadQuestion();

        });

        questionNumbers.appendChild(btn);

    });

}

// ================================
// LOAD QUESTION
// ================================

function loadQuestion(){

    const q = questions[currentQuestion];

    questionCounter.textContent =
        `Soal ${currentQuestion + 1} dari ${questions.length}`;

    questionText.textContent =
        q.question;

    optionsContainer.innerHTML = "";

    q.options.forEach((option,index)=>{

        const div =
            document.createElement("label");

        div.classList.add("option");

        if(userAnswers[currentQuestion] === index){
            div.classList.add("selected");
        }

        div.innerHTML = `
            <input
                type="radio"
                name="answer"
                value="${index}"
                ${userAnswers[currentQuestion] === index ? "checked" : ""}
            >
            ${option}
        `;

        div.addEventListener("click", ()=>{

            userAnswers[currentQuestion] = index;

            updateNumberStatus();

            loadQuestion();

        });

        optionsContainer.appendChild(div);

    });

    updateProgress();
    updateNumberStatus();

}

// ================================
// UPDATE STATUS NOMOR
// ================================

function updateNumberStatus(){

    const buttons =
        document.querySelectorAll(".question-number");

    buttons.forEach((btn,index)=>{

        btn.classList.remove(
            "active",
            "answered",
            "flagged"
        );

        if(index === currentQuestion){
            btn.classList.add("active");
        }

        if(userAnswers[index] !== undefined){
            btn.classList.add("answered");
        }

        if(flaggedQuestions[index]){
            btn.classList.add("flagged");
        }

    });

}

// ================================
// PROGRESS
// ================================

function updateProgress(){

    let progress =
        ((currentQuestion + 1) /
        questions.length) * 100;

    progressFill.style.width =
        progress + "%";

}

// ================================
// NAVIGATION
// ================================

prevBtn.addEventListener("click", ()=>{

    if(currentQuestion > 0){

        currentQuestion--;
        loadQuestion();

    }

});

nextBtn.addEventListener("click", ()=>{

    if(currentQuestion < questions.length - 1){

        currentQuestion++;
        loadQuestion();

    }

});

// ================================
// RAGU-RAGU
// ================================

flagBtn.addEventListener("click", ()=>{

    flaggedQuestions[currentQuestion] =
        !flaggedQuestions[currentQuestion];

    updateNumberStatus();

});

// ================================
// TIMER
// ================================

function startTimer(){

    const interval =
        setInterval(()=>{

            examDuration--;

            let minutes =
                Math.floor(examDuration / 60);

            let seconds =
                examDuration % 60;

            timerElement.textContent =
                `${minutes}:${seconds
                .toString()
                .padStart(2,"0")}`;

            if(examDuration <= 0){

                clearInterval(interval);

                alert(
                    "Waktu habis. Ujian selesai."
                );

                finishExam();

            }

        },1000);

}

// ================================
// FINISH MODAL
// ================================

finishBtn.addEventListener("click", ()=>{

    finishModal.classList.remove("hidden");

});

cancelFinish.addEventListener("click", ()=>{

    finishModal.classList.add("hidden");

});

confirmFinish.addEventListener("click", ()=>{

    finishExam();

});

// ================================
// HITUNG NILAI
// ================================

function finishExam(){

    examPage.classList.add("hidden");
    resultPage.classList.remove("hidden");

    let correct = 0;

    questions.forEach((q,index)=>{

        if(userAnswers[index] === q.answer){
            correct++;
        }

    });

    let wrong =
        questions.length - correct;

    let score =
        Math.round(
            (correct / questions.length)
            * 100
        );

    document.getElementById("resultNama")
        .textContent = participantName;

    document.getElementById("resultBenar")
        .textContent = correct;

    document.getElementById("resultSalah")
        .textContent = wrong;

    document.getElementById("resultNilai")
        .textContent = score;

    generateReview();

}

// ================================
// REVIEW
// ================================

function generateReview(){

    const reviewContainer =
        document.getElementById("reviewContainer");

    reviewContainer.innerHTML = "";

    questions.forEach((q,index)=>{

        const div =
            document.createElement("div");

        div.style.border =
            "1px solid #ddd";

        div.style.padding =
            "15px";

        div.style.marginBottom =
            "15px";

        div.style.borderRadius =
            "10px";

        let userAnswer =
            userAnswers[index] !== undefined
            ? q.options[userAnswers[index]]
            : "Tidak Dijawab";

        let correctAnswer =
            q.options[q.answer];

        div.innerHTML = `
            <h4>
                ${index + 1}. ${q.question}
            </h4>

            <p>
                <strong>Jawaban Anda:</strong>
                ${userAnswer}
            </p>

            <p>
                <strong>Kunci Jawaban:</strong>
                ${correctAnswer}
            </p>
        `;

        reviewContainer.appendChild(div);

    });

}

// ================================
// ANTI REFRESH
// ================================

window.addEventListener(
    "beforeunload",
    function(e){

        if(
            !examPage.classList.contains("hidden")
        ){

            e.preventDefault();

            e.returnValue =
                "Ujian sedang berlangsung.";

        }

    }
);