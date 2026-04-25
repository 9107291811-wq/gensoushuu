import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const WORD_FILES = [
  "/SF.txt",
  "/ファンタジー系.txt",
  "/ミステリーやサスペンスやサスペンスホラー.txt",
  "/慣用句.txt",
  "/純文学.txt",
  "/人間の行動.txt",
  "/生き物自然カルチャー.txt"
];

const FALLBACK_WORDS = [
  "余韻", "静謐", "輪郭", "予兆", "残響", "面影", "微睡", "隔たり", "気配", "凪",
  "星間航路", "量子帆", "虚数海", "月面庭園", "異界門", "記憶結晶", "機械神", "星詠み", "重力井戸", "魔素",
  "朝靄", "雨上がり", "夕焼け雲", "雪解け", "波打ち際", "霧雨", "月明かり", "木漏れ日", "乾いた風", "濡れた石畳",
  "狐", "白鳥", "猫", "蛍", "狼", "鴉", "蝶", "鯨", "蜻蛉", "鹿",
  "桜", "藤", "菫", "椿", "蓮", "睡蓮", "銀杏", "楓", "柳", "竹",
  "石造りの塔", "廃教会", "古城", "回廊", "水路橋", "灯台", "鐘楼", "地下聖堂", "円形劇場", "神殿"
];

const PAGE_SIZE = 1800;
const MINCHO_FONT = "'Yu Mincho', 'YuMincho', 'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'Noto Serif JP', 'Source Han Serif JP', 'Times New Roman', serif";
const SANS_FONT = "'Inter', 'Helvetica Neue', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif";

function hasKatakana(word) {
  // カタカナが1文字でも含まれているか
  return /[゠-ヿー]/.test(word);
}

function hasAlphabet(word) {
  // 英字を含むか
  return /[A-Za-z]/.test(word);
}

function isJapaneseOnly(word) {
  // ひらがな・漢字・々・ーのみで構成されているか
  return /^[぀-ゟ一-鿿々ー]+$/.test(word);
}



function hasForbidden(word) {
  return /(が|を|する|なる|やすい|弱い|人生|生きる)/.test(word);
}

function hasTooManyHiragana(word) {
  const match = word.match(/[぀-ゟ]/g);
  return match && match.length >= 4;
}

function isTooLong(word) {
  return word.length >= 6;
}

function parseWordText(text) {
  return text
    .split(/[\n\r,、\t]+/)
    .map((word) => word.trim())
    .filter((word) =>
      word &&
      !hasKatakana(word) &&
      !hasAlphabet(word) &&
      isJapaneseOnly(word) &&
      !isTooLong(word) &&
      !hasForbidden(word) &&
      !hasTooManyHiragana(word)
    );
}

async function loadAllWords() {
  const results = await Promise.allSettled(
    WORD_FILES.map(async (path) => {
      const response = await fetch(encodeURI(path));
      if (!response.ok) throw new Error(`Failed to load ${path}`);
      return response.text();
    })
  );

  const loadedWords = results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => parseWordText(result.value));

  return Array.from(new Set(loadedWords));
}

function sampleOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function makeId(word, index) {
  return `word-${index}-${Date.now()}-${Math.random().toString(36).slice(2)}-${word}`;
}

function makeEntries(wordList) {
  if (wordList.length === 0) return [];
  return Array.from({ length: PAGE_SIZE }, (_, index) => {
    const word = sampleOne(wordList);
    return { id: makeId(word, index), word, category: "all" };
  });
}

function joinSavedWords(saved) {
  return saved.map((item) => item.word).join("、");
}

const globalReset = `
  html, body, #root {
    margin: 0;
    padding: 0;
    min-height: 100%;
    background: #d8d0c3;
  }

  * {
    box-sizing: border-box;
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#d8d0c3",
    color: "#101010",
    fontFamily: MINCHO_FONT
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    background: "#d8d0c3",
    color: "#101010",
    borderBottom: "1px solid rgba(0,0,0,0.12)"
  },
  headerInner: {
    width: "100%",
    margin: "0",
    padding: "16px 8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    margin: 0,
    fontFamily: MINCHO_FONT,
    fontWeight: 400,
    fontSize: "30px",
    letterSpacing: "0.2em",
    lineHeight: 1.2
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontFamily: MINCHO_FONT,
    fontWeight: 400,
    fontSize: "20px"
  },
  menuButton: {
    appearance: "none",
    border: "none",
    background: "transparent",
    color: "#101010",
    padding: "8px 12px",
    font: "inherit",
    cursor: "pointer"
  },
  body: {
    width: "100%",
    margin: "0",
    padding: "48px 8px"
  },
  words: {
    fontFamily: MINCHO_FONT,
    fontSize: "40px",
    lineHeight: 1.65,
    letterSpacing: "0em",
    wordSpacing: "0em",
    textAlign: "justify"
  },
  wordWrap: {
    display: "inline"
  },
  word: {
    position: "relative",
    display: "inline",
    lineHeight: 1,
    color: "#101010",
    cursor: "pointer"
  },
  message: {
    fontSize: "18px",
    lineHeight: 2,
    color: "rgba(0,0,0,0.48)"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.2)",
    padding: "16px",
    backdropFilter: "blur(2px)"
  },
  modal: {
    width: "100%",
    maxWidth: "768px",
    maxHeight: "82vh",
    overflow: "hidden",
    background: "#e8e1d7",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "26px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.28)"
  },
  modalBar: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    alignItems: "center",
    marginBottom: "20px",
    fontFamily: MINCHO_FONT,
    fontSize: "16px",
    letterSpacing: "0.05em"
  },
  modalButton: {
    appearance: "none",
    border: "none",
    background: "transparent",
    color: "#101010",
    padding: 0,
    fontFamily: MINCHO_FONT,
    fontWeight: 400,
    fontSize: "16px",
    letterSpacing: "0.05em",
    cursor: "pointer"
  },
  savedWords: {
    maxHeight: "66vh",
    overflowY: "auto",
    fontFamily: MINCHO_FONT,
    fontSize: "28px",
    lineHeight: 2.1
  },
  switchOuter: {
    position: "relative",
    display: "inline-block",
    width: "32px",
    height: "16px",
    borderRadius: "999px",
    border: "1px solid rgba(0,0,0,0.35)",
    verticalAlign: "middle"
  },
  switchKnob: {
    position: "absolute",
    top: "50%",
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    transform: "translateY(-50%)",
    transition: "left 0.2s ease, background 0.2s ease"
  }
};

function Switch({ checked }) {
  return (
    <span
      style={{
        ...styles.switchOuter,
        background: checked ? "#101010" : "transparent"
      }}
      aria-hidden="true"
    >
      <span
        style={{
          ...styles.switchKnob,
          left: checked ? "18px" : "3px",
          background: checked ? "#e8e1d7" : "#101010"
        }}
      />
    </span>
  );
}

function WordToken({ entry, hasComma, onToggle }) {
  return (
    <span style={styles.wordWrap}>
      <span
        role="button"
        tabIndex={0}
        onClick={() => onToggle(entry)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle(entry);
          }
        }}
        style={styles.word}
      >
        {entry.word}
      </span>
      {hasComma && "、"}
    </span>
  );
}

export default function WordCollector() {
  const [allWords, setAllWords] = useState([]);
  const [words, setWords] = useState([]);
  const [saved, setSaved] = useState([]);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [loadMessage, setLoadMessage] = useState("");

  

  useEffect(() => {
    loadAllWords()
      .then((loadedWords) => {
        const usableWords = loadedWords.length > 0 ? loadedWords : FALLBACK_WORDS;
        setAllWords(usableWords);
        setWords(makeEntries(usableWords));
        setLoadMessage(
          loadedWords.length > 0
            ? ""
            : "プレビュー用の仮単語で表示中です。publicフォルダにtxtを置くと、その単語リストを読み込みます。"
        );
      })
      .catch(() => {
        setAllWords(FALLBACK_WORDS);
        setWords(makeEntries(FALLBACK_WORDS));
        setLoadMessage("プレビュー用の仮単語で表示中です。publicフォルダにtxtを置くと、その単語リストを読み込みます。");
      });
  }, []);

  const refreshWords = () => {
    setWords(makeEntries(allWords));
  };

  const toggleSave = (entry) => {
    setSaved((current) => {
      const exists = current.some((item) => item.id === entry.id);
      if (exists) return current.filter((item) => item.id !== entry.id);
      return [{ ...entry, savedAt: Date.now() }, ...current];
    });
  };

  const openSavedPanel = () => {
    setIsDeleteMode(false);
    setIsSavedOpen(true);
  };

  const copySaved = async () => {
    const text = joinSavedWords(saved);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <>
      <style>{globalReset}</style>
      <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.title}>幻想集</h1>
          <nav style={styles.nav}>
            <button type="button" onClick={refreshWords} style={styles.menuButton}>次の章を読む</button>
            
          </nav>
        </div>
      </header>

      <section style={styles.body}>
        {words.length === 0 ? (
          <p style={styles.message}>単語を読み込んでいます。</p>
        ) : (
          <>
            {loadMessage && <p style={{ ...styles.message, marginBottom: "32px" }}>{loadMessage}</p>}
            <AnimatePresence mode="wait">
              <motion.div
                key={words[0]?.id}
                style={styles.words}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.8,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                {words.map((entry, index) => (
                  <WordToken
                    key={entry.id}
                    entry={entry}
                    hasComma={index < words.length - 1}
                    onToggle={toggleSave}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </section>

      <AnimatePresence>
        {isSavedOpen && (
          <motion.div
            style={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              style={styles.modal}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div style={styles.modalBar}>
                <div style={{ justifySelf: "start" }}>
                  <button type="button" onClick={copySaved} style={styles.modalButton}>
                    {copied ? "コピー済み" : "コピー"}
                  </button>
                </div>

                <div style={{ justifySelf: "center", whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    onClick={() => setIsDeleteMode((value) => !value)}
                    style={{ ...styles.modalButton, display: "inline-flex", alignItems: "center", gap: "12px" }}
                    aria-pressed={isDeleteMode}
                  >
                    <span>削除モード</span>
                    <Switch checked={isDeleteMode} />
                  </button>
                </div>

                <div style={{ justifySelf: "end" }}>
                  <button type="button" onClick={() => setIsSavedOpen(false)} style={styles.modalButton}>
                    閉じる
                  </button>
                </div>
              </div>

              <div style={styles.savedWords}>
                {saved.length === 0 ? (
                  <p style={{ color: "rgba(0,0,0,0.45)", margin: 0 }}>まだ保存された単語はありません。</p>
                ) : (
                  saved.map((entry, index) => (
                    <span key={entry.id} style={{ display: "inline", whiteSpace: "nowrap" }}>
                      {index !== 0 && "、"}
                      <button
                        type="button"
                        onClick={() => {
                          if (isDeleteMode) toggleSave(entry);
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          color: "#101010",
                          font: "inherit",
                          cursor: isDeleteMode ? "pointer" : "default"
                        }}
                      >
                        {entry.word}
                      </button>
                    </span>
                  ))
                )}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    </>
  );
}

