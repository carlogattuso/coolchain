// TableWrapper.test.tsx
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // for the extra matchers
import {TableWrapper} from '../table';
import {isDevice} from '@/helpers/types/Device';
import {RenderDeviceCell} from '@/components/table/render-device-cell';

// Mock the dependencies
jest.mock('@/helpers/types/Device', () => ({
    isDevice: jest.fn(),
}));

jest.mock('@/components/table/render-device-cell', () => ({
    RenderDeviceCell: jest.fn(),
}));

describe('TableWrapper', () => {
    const data = {
        columns: [
            {key: 'name', name: 'Name'},
            {key: 'status', name: 'Status'},
            {key: 'address', name: 'Address'},
        ],
        items: [
            {name: 'Device 1', status: 'Active', address: '123', device: true},
            {name: 'Device 2', status: 'Inactive', address: '456', device: false},
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the table with the correct headers', () => {
        render(<TableWrapper data = {data}
        />);
        data.columns.forEach(column => {
            expect(screen.getByText(column.name)).toBeInTheDocument();
        });
    });

    it('should render the table rows and cells correctly', () => {
        (isDevice as jest.Mock).mockImplementation(item => item.device);
        (RenderDeviceCell as jest.Mock).mockImplementation(({device, columnKey}) => <>{device[columnKey]} < />);

        render(<TableWrapper data = {data}
        />);

        data.items.forEach(item => {
            Object.keys(item).forEach(columnKey => {
                if (columnKey !== 'device') {
                    if (item.device) {
                        expect(screen.getByText(item[columnKey])).toBeInTheDocument();
                    } else {
                        expect(screen.queryByText(item[columnKey])).not.toBeInTheDocument();
                    }
                }
            });
        });
    });

    it('should call the isDevice function with the correct item', () => {
        render(<TableWrapper data = {data}
        />);
        data.items.forEach(item => {
            expect(isDevice).toHaveBeenCalledWith(item);
        });
    });

    it('should render the custom cell with RenderDeviceCell when item is a device', () => {
        (isDevice as jest.Mock).mockImplementation(item => item.device);
        (RenderDeviceCell as jest.Mock).mockImplementation(({device, columnKey}) => <>{device[columnKey]} < />);

        render(<TableWrapper data = {data}
        />);

        data.items.forEach(item => {
            if (item.device) {
                expect(RenderDeviceCell).toHaveBeenCalledWith(expect.objectContaining({device: item}), expect.anything());
            }
        });
    });
});