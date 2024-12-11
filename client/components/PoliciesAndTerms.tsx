"use client";
import { Link } from "@nextui-org/link";

export const PoliciesAndTerms = () => {
  return (
    <>
      <footer className="bg-[#000000] z-50 bottom-0 mt-16 md:mx-4 mx-0 w-full flex md:flex-row flex-col items-center justify-between md:py-[32px] md:px-[58px] py-0 px-0 pb-6 border-t-2 border-[#191624]">
        <div className="md:text-[#fff] text-[#4C4C58] md:text-[16px] text-[10px] md:mt-0 mt-5">© 2024 Aimint. All rights reserved</div>
        <div className="md:block flex flex-col items-center md:text-[16px] text-[10px] md:gap-0 gap-2 md:mt-0 mt-5 md:mb-0 mb-2">
          <span>This site is protected by reCAPTCHA</span>
          <span>and the Google <Link
            isExternal
            className="text-current text-[#5a58f2] md:text-[16px] text-[10px]"
            href="https://policies.google.com/terms"
            title="Privacy Policy"
            underline="always"
          >
            <span>Privacy Policy</span>
          </Link>and </span>
          <span>
            <Link
              isExternal
              className="text-current text-[#5a58f2] md:text-[16px] text-[10px]"
              href="https://policies.google.com/privacy"
              title="Terms of Service"
              underline="always"
            >
              <span>Terms of Service</span>
            </Link> apply.
          </span>
        </div>
      </footer>
    </>
  );
};
