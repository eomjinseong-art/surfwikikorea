"use client";

import { useState, useEffect } from "react";
import {
  X,
  Send,
  MapPin,
  CheckCircle2,
  Waves,
  Video,
  Wind,
  Navigation,
  ShieldCheck,
  Share2,
  Check,
  Sparkles,
  PlusCircle,
} from "lucide-react";

interface InfoAndRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "info" | "request";
}

export default function InfoAndRequestModal({
  isOpen,
  onClose,
  defaultTab = "info",
}: InfoAndRequestModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "request">(defaultTab);
  const [copied, setCopied] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState({
    spotName: "",
    region: "동해",
    address: "",
    difficulty: "초급~전체",
    features: "",
    submitter: "",
    contact: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setIsSuccess(false);
      setErrorMessage("");
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const handleShare = async () => {
    const url = "https://surfwikikorea.vercel.app";
    const shareData = {
      title: "서프위키Ai — 대한민국 전국 실시간 서핑 지도",
      text: "전국 100개 서핑 스팟 · 실시간 AI 파도 점수 · 해변 웹캠 한 번에! 🏄‍♂️",
      url,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {}

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("이 링크를 복사하세요:", url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("https://formspree.io/f/xnpadyby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: `[SurfMaster] 신규 서핑 스팟 제보: ${formData.spotName}`,
          ...formData,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          setFormData({
            spotName: "",
            region: "동해",
            address: "",
            difficulty: "초급~전체",
            features: "",
            submitter: "",
            contact: "",
          });
        }, 2000);
      } else {
        setErrorMessage("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const valueProps = [
    {
      icon: Waves,
      title: "실시간 AI 파도 점수",
      desc: "해양 기상 예보 기반 초보/중급/상급 맞춤 입수 점수 계산",
      color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    },
    {
      icon: Video,
      title: "전국 30곳 해변 웹캠",
      desc: "출발 전 실시간 파도 스냅샷과 영상을 한눈에 직접 확인",
      color: "bg-red-500/10 text-red-600 border-red-500/20",
    },
    {
      icon: MapPin,
      title: "전국 100개 스팟 통합 지도",
      desc: "동해·남해·제주·서해 모든 서핑 해변을 단 한 장의 지도에",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      icon: Wind,
      title: "오프쇼어 풍향 필터",
      desc: "해변별 최적 바람 방향(오프쇼어) 스팟만 쏙 골라 검색",
      color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    },
    {
      icon: Navigation,
      title: "카카오 내비 원클릭 안내",
      desc: "스팟 카드에서 터치 한 번으로 바로 카카오 내비 길찾기 연동",
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      icon: ShieldCheck,
      title: "안전 꿀팁 & 로컬 주의사항",
      desc: "이안류·물때·암초 등 안전사고 예방을 위한 핵심 가이드",
      color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* 상단 모달 헤더 */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏄‍♂️</span>
            <div>
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <span>서프위키Ai 안내 & 제보</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-900">
                  ONLY HERE
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 font-semibold">대한민국 전국 실시간 서핑 지도</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* 탭 전환 버튼 */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200/70 shrink-0 gap-1">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-1.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === "info"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>서비스 소개 & ONLY HERE</span>
          </button>
          <button
            onClick={() => setActiveTab("request")}
            className={`py-1.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === "request"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PlusCircle size={13} className="text-sky-500" />
            <span>스팟 제보·수정</span>
          </button>
        </div>

        {/* 본문 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
          {activeTab === "info" ? (
            <div className="space-y-3.5">
              {/* 차별화 가치 헤더 */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-900">
                    ONLY HERE
                  </span>
                  <span className="text-xs font-black text-sky-200">서프위키Ai만의 6가지 기능</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-snug">
                  복잡한 기상청 수치 대신, 서퍼에게 진짜 필요한 <strong>AI 파도 점수와 실시간 웹캠</strong>을 한 번에 제공합니다.
                </p>

                {/* 원클릭 공유 버튼 */}
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-300 font-semibold">서퍼 친구들에게 링크 보내기</span>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-extrabold text-[11px] rounded-xl transition shadow-sm shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check size={12} />
                        <span>복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={12} />
                        <span>친구와 공유</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 기능 목록 그리드 */}
              <div className="space-y-2">
                {valueProps.map((item) => (
                  <div
                    key={item.title}
                    className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-2.5"
                  >
                    <div className={`p-1.5 rounded-lg border shrink-0 ${item.color}`}>
                      <item.icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 leading-snug mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 제보 바로가기 버튼 */}
              <button
                onClick={() => setActiveTab("request")}
                className="w-full py-2.5 px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
              >
                <PlusCircle size={14} />
                <span>알고 계신 서핑 스팟이나 수정사항 제보하기 →</span>
              </button>

              <div className="text-[10px] text-slate-400 text-center leading-relaxed pt-1">
                서프위키Ai는 대한민국 서퍼들을 위한 오픈 플랫폼입니다.<br />
                제휴 및 광고 문의: artcontinue@naver.com
              </div>
            </div>
          ) : (
            <div>
              {isSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle2 size={48} className="text-emerald-500 mx-auto animate-bounce" />
                  <h3 className="text-base font-extrabold text-slate-800">스팟 제보가 접수되었습니다!</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    소중한 정보 감사합니다.<br />검토 후 서프위키 전국 서핑 지도에 신속히 반영하겠습니다.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      스팟 이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="예: 양양 죽도해변, 부산 송정"
                      value={formData.spotName}
                      onChange={(e) => setFormData({ ...formData, spotName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        권역 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                      >
                        <option value="동해">동해</option>
                        <option value="남해">남해</option>
                        <option value="제주">제주</option>
                        <option value="서해">서해</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">추천 난이도</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                      >
                        <option value="초급~전체">초급~전체</option>
                        <option value="초보 추천">초보 추천</option>
                        <option value="중급">중급</option>
                        <option value="상급 전용">상급 전용</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">상세 위치 / 주소</label>
                    <input
                      type="text"
                      placeholder="예: 강원 양양군 현남면 인구리"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">스팟 특징 및 꿀팁</label>
                    <textarea
                      rows={3}
                      placeholder="바닥 지형(모래/암초), 최적 바람(남서풍 등), 주차/샤워 팁 등"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">제보자 (닉네임)</label>
                      <input
                        type="text"
                        placeholder="예: 양양서퍼"
                        value={formData.submitter}
                        onChange={(e) => setFormData({ ...formData, submitter: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">연락처 (선택)</label>
                      <input
                        type="text"
                        placeholder="이메일 또는 인스타"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{isSubmitting ? "제보 전송 중..." : "서핑 스팟 제보하기"}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
