"use client";

import React from "react";
import useSWR from "swr";
import {Auditors} from "@/components/auditors";

const fetcher = (...args: any[]) => {
    // @ts-ignore
    return fetch(...args).then(res => res.json());
}
const AuditorsPage = () => {

    const {data, error, isLoading} = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/auditors`,
        fetcher
    )

    if (error) return <p>Failed to load.</p>
    if (isLoading) return <p>Loading...</p>

    return <Auditors data={data}/>;
};

export default AuditorsPage;
