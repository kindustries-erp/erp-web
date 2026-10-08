import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2TablePagination } from "./V2TablePagination";

const meta: Meta<typeof V2TablePagination> = {
  title: "V2/Molecules/V2TablePagination",
  component: V2TablePagination,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[720px] max-w-full">
        <Story />
      </div>
    ),
  ],
};
export default meta;

const Demo = ({
  total,
  initialPage = 1,
  initialSize = 50,
}: {
  total: number;
  initialPage?: number;
  initialSize?: number;
}) => {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  return (
    <V2TablePagination
      page={page}
      pageSize={size}
      total={total}
      onPageChange={setPage}
      onPageSizeChange={(s) => {
        setSize(s);
        setPage(1);
      }}
    />
  );
};

export const FirstPage = () => <Demo total={2068} />;
export const MiddlePage = () => <Demo total={2068} initialPage={21} />;
export const LastPage = () => <Demo total={2068} initialPage={42} />;
export const FewPages = () => <Demo total={120} initialSize={50} />;
export const SinglePage = () => <Demo total={12} />;
export const Empty = () => <Demo total={0} />;
export const Narrow = () => (
  <div className="w-[360px]">
    <Demo total={2068} initialPage={3} />
  </div>
);
