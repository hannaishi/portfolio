const btn = document.querySelector(".header-btn-menu");
const nav = document.querySelector(".header-menu");

btn.addEventListener("click", () => {
    nav.classList.toggle("open-menu");
    btn.innerHTML = btn.innerHTML === "メニュー" ? "閉じる" : "メニュー";
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDaV6-4wGkvjU44anq-bYGU00pwEV1mq64",
    authDomain: "my-app-5d2d7.firebaseapp.com",
    projectId: "my-app-5d2d7",
    storageBucket: "my-app-5d2d7.firebasestorage.app",
    messagingSenderId: "593440483589",
    appId: "1:593440483589:web:1a289311074730bb8aef6c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newsList = document.getElementById("news-list");

function getCategoryClass(category) {
    switch (category) {
        case "新商品":
            return "news-label--product";

        case "イベント":
            return "news-label--event";

        case "お知らせ":
            return "news-label--news";

        default:
            return "";
    }
}

async function loadNews() {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
        const post = doc.data();

        const date = post.createdAt
            ? new Date(post.createdAt.seconds * 1000).toLocaleDateString(
                  "ja-JP",
              )
            : "";

        if (post.status !== "published") {
            return;
        }
        console.log(newsList);
        newsList.innerHTML += `
        <article class="news-post">
            <a href="news.html">
                <div class="news-meta">
                    <img
                        width="16"
                        height="16"
                        src="img/calender.svg"
                        alt="カレンダー"
                    >

                    <time class="c-date">
                        ${date}
                    </time>

                    <span class="news-label ${getCategoryClass(post.category)}">
                        ${post.category}
                    </span>
                </div>

                <h3 class="news-post-title">
                    ${post.title}
                </h3>
            </a>
        </article>
    `;
    });
}

loadNews();
