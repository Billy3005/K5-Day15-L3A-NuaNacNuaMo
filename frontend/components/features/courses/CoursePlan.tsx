import type { PlanDay } from "../../../types/course";
import { cn } from "../../../lib/utils";

const headingClass = "flex min-h-11 items-center text-[15px] font-semibold uppercase tracking-wider text-muted";

/**
 * Mục lục 5 ngày dạng dòng thời gian. Chỉ ngày đang mở có bài; các ngày khác chỉ hiện tiêu đề và mục tiêu.
 * Dưới md: <details> gập được. Từ md: khối riêng luôn hiện đủ, không phụ thuộc <details> đang đóng hay mở.
 * Mỗi lúc chỉ một khối được hiển thị (khối kia `display: none`, trình đọc màn hình không đọc).
 */
export function CoursePlan({ plan, openDay }: { plan: PlanDay[]; openDay: number }) {
  const heading = `Lộ trình ${plan.length} ngày`;

  return (
    <div className="self-start md:sticky md:top-24">
      <details open className="group md:hidden">
        <summary className={cn(headingClass, "justify-between rounded-lg")}>
          {heading}
          <span aria-hidden="true" className="text-faint transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <PlanDays plan={plan} openDay={openDay} />
      </details>
      <div className="hidden md:block">
        <p className={headingClass}>{heading}</p>
        <PlanDays plan={plan} openDay={openDay} />
      </div>
    </div>
  );
}

function PlanDays({ plan, openDay }: { plan: PlanDay[]; openDay: number }) {
  return (
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
  );
}
