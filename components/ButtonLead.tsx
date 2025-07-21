"use client";

import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import apiClient from "@/libs/api";

// This component is used to collect the emails from the landing page
// You'd use this if your product isn't ready yet or you want to collect leads
// For instance: A popup to send a freebie, joining a waitlist, etc.
// It calls the /api/lead/route.js route and store a Lead document in the database
const ButtonLead = ({ extraStyle }: { extraStyle?: string }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [otherIndustry, setOtherIndustry] = useState<string>("");
  const [companySize, setCompanySize] = useState<string>("");

  const industryOptions = [
    "", // Default empty option
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Real Estate",
    "Other",
  ];

  const companySizeOptions = [
    "", // Default empty option
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1001-5000 employees",
    "5001+ employees",
  ];
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!firstName || !lastName || !email) {
      toast.error("First Name, Last Name, and Email are required.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.post("/lead", {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        message,
        company_name: companyName,
        industry: industry === "Other" ? otherIndustry : industry,
        company_size: companySize,
      });
      console.log("Lead API response:", response);
      // apiClient returns response.data directly, so check response.success
      const isSuccess = (response as unknown as { success: boolean })?.success === true;
      if (isSuccess) {
        toast.success("Thanks for joining the waitlist! Redirecting to Interactive Demo...");
        if (inputRef.current) {
          inputRef.current.blur();
        }
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setCompanyName("");
        setIndustry("");
        setOtherIndustry("");
        setCompanySize("");
        setIsDisabled(true);
        
        // Redirect to Interactive Demo after a short delay
        setTimeout(() => {
          router.push('/demo');
        }, 2000);
      } else {
        // Type guard for error message
        const errorMsg = (response as { error?: string })?.error || "Submission failed. Please try again.";
        toast.error(errorMsg);
      }
    } catch (error: unknown) {
      let errorMsg = "Something went wrong. Please try again.";
      if (typeof error === "object" && error !== null && 'response' in error) {
        const errObj = error as { response?: { data?: { error?: string } } };
        errorMsg = errObj.response?.data?.error || errorMsg;
      }
      toast.error(errorMsg);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form
      className={`w-full max-w-xs space-y-3 ${extraStyle ? extraStyle : ""}`}
      onSubmit={handleSubmit}
    >
      <div className="flex gap-2">
        <label htmlFor="firstName" className="sr-only">First Name</label>
        <input
          id="firstName"
          required
          type="text"
          value={firstName}
          placeholder="First Name"
          className="input input-bordered w-full"
          onChange={(e) => setFirstName(e.target.value)}
        />
        <label htmlFor="lastName" className="sr-only">Last Name</label>
        <input
          id="lastName"
          required
          type="text"
          value={lastName}
          placeholder="Last Name"
          className="input input-bordered w-full"
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <label htmlFor="email" className="sr-only">Email</label>
      <input
        id="email"
        required
        type="email"
        value={email}
        ref={inputRef}
        autoComplete="email"
        placeholder="you@email.com"
        className="input input-bordered w-full"
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="companyName" className="sr-only">Company Name</label>
      <input
        id="companyName"
        type="text"
        value={companyName}
        placeholder="Company Name (optional)"
        className="input input-bordered w-full"
        onChange={(e) => setCompanyName(e.target.value)}
      />
      <label htmlFor="industry" className="sr-only">Industry</label>
      <select
        id="industry"
        value={industry}
        className={`select select-bordered w-full text-base ${industry ? "" : "text-gray-400"}`}
        onChange={(e) => {
          setIndustry(e.target.value);
          if (e.target.value !== "Other") {
            setOtherIndustry("");
          }
        }}
      >
        {industryOptions.map((option) => (
          <option key={option} value={option}>
            {option === "" ? "Select Industry (optional)" : option}
          </option>
        ))}
      </select>
      {industry === "Other" && (
        <>
          <label htmlFor="otherIndustry" className="sr-only">Please specify your industry</label>
          <input
            id="otherIndustry"
            type="text"
            value={otherIndustry}
            placeholder="Please specify your industry"
            className="input input-bordered w-full"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtherIndustry(e.target.value)}
          />
        </>
      )}
      <label htmlFor="companySize" className="sr-only">Company Size</label>
      <select
        id="companySize"
        value={companySize}
        className={`select select-bordered w-full text-base ${companySize ? "" : "text-gray-400"}`}
        onChange={(e) => setCompanySize(e.target.value)}
      >
        {companySizeOptions.map((option) => (
          <option key={option} value={option}>
            {option === "" ? "Select Company Size (optional)" : option}
          </option>
        ))}
      </select>
      <label htmlFor="phone" className="sr-only">Phone</label>
      <input
        id="phone"
        type="tel"
        value={phone}
        placeholder="Phone (optional)"
        className="input input-bordered w-full"
        onChange={(e) => setPhone(e.target.value)}
      />
      <label htmlFor="message" className="sr-only">Message</label>
      <textarea
        id="message"
        value={message}
        placeholder="Message (optional)"
        className="textarea textarea-bordered w-full"
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
      />
      <button
        className="bg-[#18C5C2] text-white font-bold py-3 px-8 rounded-full hover:bg-[#1A7F6B] transition duration-300 block mx-auto flex items-center justify-center gap-2"
        type="submit"
        disabled={isDisabled}
      >
        Interactive Demo
        {isLoading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 ml-2"
          >
            <path
              fillRule="evenodd"
              d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </form>
  );
};

export default ButtonLead;
