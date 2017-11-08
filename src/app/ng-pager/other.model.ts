// 每次至少拉取的比例，少于则要多拉一页
// 比如，1页10条的时候，如果本次的计算结果只要补充2条，这个比例小于1/3，所以要再多取一页
export const LEAST_FETCHING_PERCENT = 1 / 3;

export interface DataSpan {
    start: number;
    end: number;
}
