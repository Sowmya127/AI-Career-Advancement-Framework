"use client";
import React from "react";
import { PlayCircleIcon, SpeechIcon, Map, FileCheck, Brain } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
     
  return (
    <div className="z-[10] bg-slate-100 p-6 w-[200px] fixed top-[64px] left-0 h-full">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col justify-between gap-2">
          {/* Existing Interviews Menu Item */}
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname.endsWith("/dashboard") ||
              pathname.includes("/interviews")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard")}
          >
            <PlayCircleIcon className="font-thin mr-2" />
            <p className="font-medium">Interviews</p>
          </div>
           
          {/* Existing Interviewers Menu Item */}
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname.endsWith("/interviewers")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/interviewers")}
          >
            <SpeechIcon className="font-thin mr-2" />
            <p className="font-medium">Interviewers</p>
          </div>
           
          {/* Career Roadmap Menu Item */}
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname.includes("/career-roadmap")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/career-roadmap")}
          >
            <Map className="font-thin mr-2" />
            <p className="font-medium">Career Roadmap</p>
          </div>
           
          {/* Resume Parser Menu Item */}
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname.includes("/resume-parser")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/resume-parser")}
          >
            <FileCheck className="font-thin mr-2" />
            <p className="font-medium">Resume Parser</p>
          </div>

          {/* NEW: Quiz Generator Menu Item */}
          <div
            className={`flex flex-row p-3 rounded-md hover:bg-slate-200 cursor-pointer ${
              pathname.includes("/quiz")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/quiz")}
          >
            <Brain className="font-thin mr-2" />
            <p className="font-medium">Quiz Generator</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
