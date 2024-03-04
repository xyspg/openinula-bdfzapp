import * as React from "openinula";
import {useState, useEffect, useRef, useReducer, useCallback} from "openinula";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import style from "../styles/markdown-styles.module.css";
import { SSE } from "sse.js";
import { Frown, User } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export function SearchDialog() {
  const [search, setSearch] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("")
  const eventSourceRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasFlaggedContent, setHasFlaggedContent] = useState(false);
  const [notificationShown, setNotificationShown] = useState(false);
  const [politicalSensitive, setPoliticalSensitive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const delay = 5000; // ms

  const sampleQuestion = [
    "我在升旗仪式迟到了16分钟会发生什么?",
    "我如何申请荣誉文凭?",
    "我在 Dalton 应该上 Statistics 还是 Calculus",
  ];

  const showMoreList = [
    {
      category: "校规校纪",
      content: ["北大附中的培养目标是什么？", "处分的撤销程序是什么样的？"],
    },
    {
      category: "学校事务",
      content: [
        "如何申请荣誉文凭",
        "如何请假",
        "如何更换六选三选科",
        "医务室在哪里",
        "心理咨询预约的邮箱是什么",
        "如何申请创建社团",
        "如何申请社团经费",
        "老师记错考勤了怎么办？",
        "学考合格考缺考或不合格对个人是否有影响",
        "平板电脑如何申请领取",
      ],
    },
    {
      category: "本部课程",
      content: [
        "Track Team 是什么",
        "数学荣誉课程的内容是什么",
        "BIY1101-N是什么课",
      ],
    },
    {
      category: "国际部课程",
      content: [
        "What are CLA courses?",
        "I'm interested in neuroscience at Dalton.",
        "Could you introduce Dalton's economics courses?",
        "Please provide information on Dalton's Global Studies courses.",
        "Do I have to take IRP3 to graduate?",
        "What are the prerequisites for studying calculus?",
      ],
    },
  ];

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "Escape") {
        console.log("esc");
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleNotification = () => {
    setNotificationShown(true);
    setInterval(() => {
      setNotificationShown(false);
    }, 7000);
  };

  const isBrowser = () => typeof window !== "undefined";

  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({top: 0, behavior: "smooth"});
  }

  const ScrollToTopContainerVariants = {
    hide: {opacity: 0, y: 100},
    show: {opacity: 1, y: 0},
  };


  const handleConfirm = async (query) => {
    const currentTime = new Date().getTime();
    const delayInSec = (delay - (currentTime - lastRequestTime)) / 1000;
    if (currentTime - lastRequestTime < delay) {
      // If the time since the last request is less than the delay, prevent request and show error
      alert(`请求过于频繁，请${delayInSec}秒后再试`);
      return;
    } else {
      setLastRequestTime(currentTime); // Update lastRequestTime
    }

    if (isGenerating) stopGenerating();
    setAnswer("");
    setQuestion(query);
    setSearch("");
    setHasError(false);
    setIsLoading(true);
    setIsGenerating(true);
    setHasFlaggedContent(false);
    setPoliticalSensitive(false);
    setErrorMessage("");

    const response = await fetch("https://bdfz.app/api/v1/vector-search", {
      method: "POST",
      body: JSON.stringify({query, stream: false}),
    }).then((res) => res.json());
    console.log(response);

    if (response.error) {
      handleError(response.error);
    }

    setAnswer(response.choices[0].message.content)

    function handleError(err) {
      setIsGenerating(false);
      setIsLoading(false);
      const errorMessage = err.error
      console.error(errorMessage);
      if (errorMessage === "Flagged content") {
        setHasFlaggedContent(true);
        setIsGenerating(false);
        setAnswer("500 Internal Server Error");
      } else if (errorMessage === "Flagged content politics") {
        setHasError(true);
        setHasFlaggedContent(true);
        setPoliticalSensitive(true);
      } else {
        // handle regular error, show `server busy`
        setHasError(true);
        setErrorMessage(errorMessage);
      }
    }


    setIsLoading(false);
    setIsGenerating(false)
    }


  const handleSubmit = (e) => {
    e.preventDefault();
    handleConfirm(search);
  };
  const stopGenerating = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13 && !isGenerating) {
      e.preventDefault();
      handleConfirm(search);
    }
  };

  const inputRef = useRef(null);
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <>
      <div>
        <div className="grid gap-4 text-slate-700 w-screen px-6 pb-4 max-w-3xl">
          {question && (
            <div className="flex gap-4">
              <span className="bg-slate-100 dark:bg-slate-300 p-2 w-8 h-8 rounded-full text-center flex items-center justify-center">
                <User width={18} />
              </span>
              <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-100">
                {question}
              </p>
            </div>
          )}

          {isLoading && (
            <div
              className="flex items-center gap-4 dark:text-white max-w-3xl"
            >
              <div className="w-7 ml-0.5 h-7 bg-gradient-to-r from-red-900 to-red-800 ring-red-600 ring-1 rounded-md border border-brand-400 flex items-center justify-center shadow-sm ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-4 h-4 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  ></path>
                </svg>
              </div>
              <div className="ml-1 bg-neutral-500 h-[17px] w-[11px] animate-pulse animate-bounce" />
            </div>
          )}

          {hasError && (
            <div className="flex items-center gap-4">
              <span className="bg-red-100 p-2 w-8 h-8 rounded-full text-center flex items-center justify-center">
                <Frown width={18} />
              </span>
              <span className="text-slate-700 dark:text-slate-100">
                {errorMessage ? errorMessage : "服务器繁忙，请稍后再试"}
              </span>
            </div>
          )}

          {answer && !hasError ? (
            <>
              <div className="flex gap-4 my-1 dark:text-white max-w-[85vw]">
                <div className="w-7 min-w-[28px] ml-0.5 h-7 bg-gradient-to-r from-red-900 to-red-800 ring-red-600 ring-1 rounded-md border border-brand-400 flex items-center justify-center shadow-sm ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    ></path>
                  </svg>
                </div>
                <div className="w-full overflow-x-auto">
                  {/*<ReactMarkdown*/}
                  {/*  linkTarget="_blank"*/}
                  {/*  className={style.reactMarkDown}*/}
                  {/*  remarkPlugins={[remarkGfm]}*/}
                    {answer}
                  {/*</ReactMarkdown>*/}
                </div>
              </div>
              <div>
              </div>
            </>
          ) : null}

          <div className="relative">
            <Input
              ref={inputRef}
              placeholder="输入问题..."
              name="search"
              value={search}
              maxLength={4000}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="col-span-3"
              autoFocus={true}
            />
          </div>
          <div className="rounded-md border px-1.5 py-3 md:p-6 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 justify-between items-center bg-scale-400 border-scale-500 dark:bg-scale-100 dark:border-scale-300 mb-3 w-full gap-2">
            <div className="text-scale-1200 dark:text-neutral-200 flex flex-row items-start gap-2 justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text -scale-900"
              >
                <path d="M6 18h8"></path>
                <path d="M3 22h18"></path>
                <path d="M14 22a7 7 0 1 0 0-14h-1"></path>
                <path d="M9 14h2"></path>
                <path d="M8 6h4"></path>
                <path d="M13 10V6.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2.5a.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V10c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2Z"></path>
              </svg>
              <div className="flex flex-1 items-center justify-between">
                <div className="text-left">
                  <h3 className="text-scale-1200 dark:text-neutral-200 block text-[13px] md:text-sm font-medium mb-1">
                    BDFZ AI 处于 Beta 版本，可能会产生错误答案
                  </h3>
                  <div className="text-xs text-scale-900 dark:text-neutral-300 inline-flex flex-row leading-5">
                    <p>
                      回答由 AI 检索学校官方文件后生成，请以{" "}
                      <br className="md:hidden" />
                      <a
                        href="https://pkuschool.yuque.com/infodesk/sbook?#%20%E3%80%8A%E5%8C%97%E5%A4%A7%E9%99%84%E4%B8%AD%E5%AD%A6%E7%94%9F%E6%89%8B%E5%86%8C%E3%80%8B"
                        target="_blank"
                        className="text-neutral-500 underline dark:text-neutral-200 underline-offset-2 hover:opacity-70"
                        rel="noopener noreferer"
                      >
                        北大附中学生手册
                      </a>
                      &nbsp;等文件为准
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={isGenerating ? stopGenerating : handleSubmit}
              className="md:w-20 w-full bg-red-900 block shadow-md hover:bg-red-800 dark:bg-red-900 dark:hover:bg-red-800"
            >
              {isGenerating ? "Stop" : "Ask"}
            </Button>
          </div>
          <div className="text-xs text-gray-500 flex flex-col md:flex-row flex-grow space-y-2 md:space-y-0 gap-2 dark:text-gray-100 items-stretch md:items-start">
            <div className="pt-1.5 mx-auto md:w-20">Or try:</div>
            <div className="flex flex-col gap-4">
              <div className="mt-1 flex gap-3 md:gap-x-2.5 md:gap-y-1 flex-col md:flex-row w-full md:w-auto md:flex-wrap">
                {sampleQuestion.map((q) => (
                  <button
                    key={q}
                    type="button"
                    data-umami-event={"ask: " + q}
                    className="px-1.5 py-3 md:py-0.5 md:px-1.5 md:w-fit h-full
                    md:h-auto cursor-pointer
                  bg-slate-50 dark:bg-neutral-700 text-sm md:text-xs
                  hover:bg-slate-100 dark:hover:bg-gray-600
                  rounded-md border border-slate-200 dark:border-neutral-600
                  transition-colors"
                    onClick={(_) => {
                      setSearch(q);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div
                className="md:w-fit h-full
                  md:h-auto cursor-pointer
                  flex justify-center
                  bg-white dark:bg-neutral-800
                  dark:text-white text-[15px]
                  rounded-md underline-offset-4 underline
                  transition-colors"
                onClick={() => {
                  setShowMore(!showMore);
                }}
              >
                {showMore ? "收起列表" : "查看更多..."}
              </div>
            </div>
          </div>
            {showMore ? (
              <>
                <hr />
                <div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className=" flex flex-col justify-start gap-4">
                    {showMoreList.map((category) => (
                      <>
                        <div className="flex flex-col  md:flex-row items-center gap-4 md:gap-12">
                          <h1 className="text-xl font-bold dark:text-white md:w-1/4">
                            {category.category}
                          </h1>
                          <div className="flex flex-wrap gap-4 md:w-3/4 justify-start">
                            {category.content.map((content) => (
                              <>
                                <div
                                  className="
                          text-sm text-neutral-700 dark:text-neutral-200
                          px-2.5 py-1.5 md:px-3 md:py-1.5
                          border-2 border-neutral-200 dark:border-neutral-600
                          rounded-xl cursor-pointer
                          bg-slate-50 hover:bg-slate-100
                          dark:bg-neutral-700  dark:hover:bg-gray-600
                          "
                                  data-umami-event={"ask: " + content}
                                  onClick={() => {
                                    handleConfirm(content);
                                  }}
                                >
                                  {content}
                                </div>
                              </>
                            ))}
                          </div>
                        </div>
                        <hr />
                      </>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
        </div>
      </div>
    </>
  );
}
