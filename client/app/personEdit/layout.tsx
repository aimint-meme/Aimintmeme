import { PoliciesAndTerms } from "@/components/PoliciesAndTerms";

export default function PersonEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="flex flex-col items-center justify-center gap-4 py-4 md:py-5">
        <div className="flex flex-col text-center justify-center w-full  sm:max-w-[1280px]">
          {children}
        </div>
      </section>
      {/* <PoliciesAndTerms /> */}
    </>
  );
}
