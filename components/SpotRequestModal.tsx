"use client";

import { useState } from "react";
import { X, Send, MapPin, CheckCircle2, AlertCircle } from "lucide-react";

interface SpotRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpotRequestModal({ isOpen, onClose }: SpotRequestModalProps) {
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

  if (!isOpen) return null;

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
        }, 2200);
      } else {
        setErrorMessage("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏄‍♂️</span>
            <div>
              <h2 className="text-sm font-black text-slate-800">서핑 스팟 추가 요청</h2>
              <p className="text-[11px] text-slate-500">알고 계신 숨은 명소나 수정 사항을 제보해 주세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 본문 / 폼 */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-extrabold text-slate-800">스팟 제보가 접수되었습니다!</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              소중한 정보 감사합니다.<br />검토 후 SurfMaster 전국 서핑 지도에 신속히 반영하겠습니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-3.5 overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-xs text-rose-600">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">스팟 이름 *</label>
              <input
                type="text"
                required
                placeholder="예: 양양 남애리 숨은 포인트, 포항 칠포 북측"
                value={formData.spotName}
                onChange={(e) => setFormData({ ...formData, spotName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">해역 권역 *</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="동해">동해 (강원/경북/울산)</option>
                  <option value="남해">남해 (부산/전남)</option>
                  <option value="제주">제주</option>
                  <option value="서해">서해 (충남/인천/경기)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">추천 난이도</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="초급~전체">초급 입문 ~ 누구나</option>
                  <option value="중급">중급자 (라인업 가능)</option>
                  <option value="상급">상급자 (배럴/암초/조류)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">위치 또는 주소</label>
              <input
                type="text"
                placeholder="예: 강원 고성군 죽왕면 인근, 송지호 북측 500m"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">스팟 특징 및 서핑 꿀팁</label>
              <textarea
                rows={3}
                placeholder="파도 형태(비치/리프), 추천 물때, 주변 주차/샤워장 정보, 주의할 점 등"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">제보자 닉네임</label>
                <input
                  type="text"
                  placeholder="예: 양양서퍼"
                  value={formData.submitter}
                  onChange={(e) => setFormData({ ...formData, submitter: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">이메일/연락처 (선택)</label>
                <input
                  type="text"
                  placeholder="반영 결과 알림용"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>전송 중...</span>
              ) : (
                <>
                  <Send size={14} />
                  <span>스팟 제보 제출하기</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
