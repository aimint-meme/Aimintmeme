"use client";
import React, { useState, useMemo, useRef } from "react";
import { Checkbox, Form, Upload } from "antd";
import {
  Input,
} from "@nextui-org/react";
import { Trend } from "@/components/Trend";

export default function PricingPage() {
  return (
    <div className="flex flex-col text-center justify-center items-center w-full gap-7 mt-10">
        <Trend />
    </div>
  );
}
