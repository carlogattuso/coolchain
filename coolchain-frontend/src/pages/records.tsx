import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import {GetServerSideProps, Metadata} from 'next';
import clientPromise from '../lib/mongodb';
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";
import RecordsTable from "@/components/Tables/RecordsTable";
import {RecordsPageProps} from "@/types/records";

export const metadata: Metadata = {
    title: "Coolchain | Records",
    description: "Records stored in the database",
};

const RecordsPage: React.FC<RecordsPageProps> = ({ records }) => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Records" />
            <div className="flex flex-col gap-10">
                <RecordsTable records={records} />
            </div>
        </DefaultLayout>
    );
};

export const getServerSideProps: GetServerSideProps<RecordsPageProps> = async () => {
    const client = await clientPromise;
    const db = client.db('coolchain');
    const records = await db
        .collection('Records')
        .find({})
        .sort({ timestamp: -1 })
        .toArray();

    return {
        props: {
            records: JSON.parse(JSON.stringify(records)),
        },
    };
};

export default RecordsPage;