// pages/recordsTable.tsx

import React from 'react';
import {RecordsPageProps} from "@/types/records";


const RecordsTable: React.FC<RecordsPageProps> = ({records}) => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Sensor
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Temp. ºC
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Tx Hash
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, key) => (
              <tr key={key}>
                {/* Sensor ID*/}
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="text-base">
                    {record.sensorId}
                  </h5>
                </td>
                {/* Temperature */}
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-base">{record.value}</p>
                </td>
                {/* Tx Hash */}
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {record.txHash}
                  </p>
                </td>
                {/* Date */}
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className={"inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium"}>
                    {new Date(record.timestamp).toISOString()}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordsTable;
