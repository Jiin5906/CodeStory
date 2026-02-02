import React from 'react';
import MonthlyReport from '../stats/MonthlyReport';

/**
 * ReportView — 통계 및 리포트 페이지
 *
 * 하단 탭바의 '리포트' 탭에서 표시되는 페이지
 * 기존 MonthlyReport 컴포넌트를 활용하여 감정 통계를 표시
 */
const ReportView = ({ user, diaries }) => {
    return (
        <div
            className="w-full h-full overflow-y-auto bg-gradient-to-b from-[#FFF8F3] to-[#FFE8F0]"
            style={{ paddingBottom: '6rem' }} // 하단 탭바 공간 확보
            data-gtm="view-report"
        >
            <div className="px-6 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 감정 리포트</h1>
                    <p className="text-gray-500 text-sm">
                        {user?.nickname || '게스트'}님의 감정 여정을 분석해요
                    </p>
                </div>

                {/* 통계 컴포넌트 */}
                <MonthlyReport user={user} diaries={diaries} />
            </div>
        </div>
    );
};

export default ReportView;
