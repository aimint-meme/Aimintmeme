import { Suspense } from 'react'
import { Checkbox, Form, Upload } from "antd";
import { AICreateImage } from "@/components/AICreateImage";
import {
  Input,Spinner
} from "@nextui-org/react";
function SearchBarFallback() {
  return <Spinner label="Loading..." color="primary" labelColor="primary"/>
}

export default function PricingPage() {
  return (
    <div className="md:order-1 -order-1 w-full md:flex flex-col text-center justify-center items-center md:w-11/12 md:gap-7 md:p-10 pt-1 rounded-2xl">
        <Suspense fallback={<SearchBarFallback />}>
          <AICreateImage />
        </Suspense>
      </div>
  );
}
