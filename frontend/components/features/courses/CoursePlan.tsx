import type { PlanDay } from "../../../types/course";

/** Mục lục 5 ngày. Chỉ ngày đang mở có bài; các ngày khác chỉ hiện tiêu đề và mục tiêu. */
export function CoursePlan({ plan, openDay }: { plan: PlanDay[]; openDay: number }) {
  return (
    <details open className="self-start rounded-lg border border-line bg-paper px-4 py-1">
      <summary className="min-h-11 py-2 font-semibold">Lộ trình 5 ngày</summary>
      <ol className="mb-3 space-y-3">
        {plan.map((item) => {
          const isOpen = item.day === openDay;
          return (
            <li
              key={item.day}
              aria-current={isOpen ? "step" : undefined}
              className={isOpen ? "border-l-4 border-action pl-3" : "pl-4"}
            >
              <p className="font-semibold leading-snug">
                Ngày {item.day} · {item.title}
              </p>
              {isOpen && <p className="text-[15px] font-semibold text-action">Đang mở</p>}
              <p className="text-[15px] leading-snug text-muted">{item.objective}</p>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
