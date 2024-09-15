// src/pages/__tests__/records.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import RecordsPage, { getServerSideProps } from '../records';
import { RecordsPageProps } from '@/types/records';
import '@testing-library/jest-dom';

jest.mock('../../lib/mongodb', () => ({
    __esModule: true,
    default: Promise.resolve({
        db: () => ({
            collection: () => ({
                find: () => ({
                    sort: () => ({
                        toArray: () => [
                            {
                                _id: '1',
                                timestamp: '2023-10-12T12:34:56Z',
                                txHash: 'hash123',
                                value: 50,
                                sensorId: 'sensor1',
                            },
                        ],
                    }),
                }),
            }),
        }),
    }),
}));

const mockRecords: RecordsPageProps = {
    records: [
        {
            _id: '1',
            timestamp: '2023-10-12T12:34:56Z',
            txHash: 'hash123',
            value: 50,
            sensorId: 'sensor1',
        },
    ],
};

describe('RecordsPage', () => {
    it('renders without crashing', () => {
        render(<RecordsPage {...mockRecords} />);
        expect(screen.queryAllByText('Records')[0]).toBeInTheDocument();
    });

    it('displays the records', () => {
        render(<RecordsPage {...mockRecords} />);
        expect(screen.getByText(/sensor1/)).toBeInTheDocument();
    });
});

describe('getServerSideProps', () => {
    it('fetches records from the database', async () => {
        const context = {};
        const result = await getServerSideProps(context);

        expect(result).toEqual({
            props: {
                records: [
                    {
                        _id: '1',
                        timestamp: '2023-10-12T12:34:56Z',
                        txHash: 'hash123',
                        value: 50,
                        sensorId: 'sensor1',
                    },
                ],
            },
        });
    });
});