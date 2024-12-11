import { PoliciesAndTerms } from "@/components/PoliciesAndTerms";

export default function TokensCardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='md:pb-0 pb-12'>
      <section className="flex flex-col items-center justify-center gap-4 py-4 md:py-5">
        <div className="inline-block text-center justify-center w-full">
          {children}
        </div>
      </section>
      {/* {<PoliciesAndTerms />} */}
    </div>
  );
}
