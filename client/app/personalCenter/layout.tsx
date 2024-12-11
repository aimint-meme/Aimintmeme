import { Suspense } from 'react';
import { Spinner } from "@nextui-org/react";
import { PoliciesAndTerms } from "@/components/PoliciesAndTerms";
function SearchBarFallback() {
  return <Spinner label="Loading..." color="primary" labelColor="primary" />
}
export default function PersonnalCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="flex flex-col items-center justify-center gap-4 py-0 md:py-0">
        <div className="text-center flex flex-col justify-center pb-8 w-full  sm:max-w-[1280px]">
          <Suspense fallback={<SearchBarFallback />}>
            {children}
          </Suspense>
        </div>
      </section>
      {/* <PoliciesAndTerms /> */}
    </>
  );
}
