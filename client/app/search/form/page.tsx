"use client";
import React, { useState, useMemo, useRef } from "react";
import { Checkbox, Form, Upload } from "antd";
import { BaseForm } from "@/components/baseForm";
import {
  Input,
} from "@nextui-org/react";

export default function PricingPage() {
  return (
    <div className="w-full flex flex-col text-center justify-center items-center md:w-11/12 gap-7 bg-[#14111C] p-3 md:p-10 rounded-2xl mt-10">
        <BaseForm />
    </div>
  );
}
