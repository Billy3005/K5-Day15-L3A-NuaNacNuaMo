import type { PlanDay } from "../../../types/course";
import { cn } from "../../../lib/utils";

/** Mục lục 5 ngày dạng dòng thời gian. Chỉ ngày đang mở có bài; các ngày khác chỉ hiện tiêu đề và mục tiêu. */
export function CoursePlan({ plan, openDay }: { plan: PlanDay[]; openDay: number }) {
  return (
    <details open className="group self-start md:sticky md:top-24">
      <summary className="flex min-h-11 items-center justify-between rounded-lg text-[15px] font-semibold uppercase tracking-wider text-muted md:pointer-events-none md:list-none">
        Lộ trình {plan.length} ngày
        <span aria-hidden="true" className="text-faint transition-transform group-open:rotate-180 md:hidden">
          ▾
        </span>
      </summary>
      <ol className="mt-3">
        {plan.map((item, index) => {
          const isOpen = item.day === openDay;
          const isLast = index === plan.length - 1;
          return (
            <li key={item.day} aria-current={isOpen ? "step" : undefined} className="relative flex gap-3.5 pb-6">
              {!isLast && <span aria-hidden="true" className="absolute left-[15px] top-9 bottom-0 w-px bg-line" />}
              <span
                aria-hidden="true"
                className={cn(
                  "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-bold",
                  isOpen ? "bg-action text-white" : "border border-line bg-paper text-muted",
                )}
              >
                {item.day}
              </span>
              <div className={cn("min-w-0 pt-0.5", isOpen && "rounded-lg")}>
                <p className={cn("font-semibold leading-snug", !isOpen && "text-ink/80")}>
                  <span className="sr-only">Ngày {item.day}: </span>
                  {item.title}
                </p>
                {isOpen && <p className="text-[14px] font-semibold text-action">Bài hôm nay</p>}
                <p className="mt-0.5 text-[15px] leading-snug text-muted">{item.objective}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
