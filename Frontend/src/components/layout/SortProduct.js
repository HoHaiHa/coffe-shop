import { Select } from "antd";
import { BsSortDown } from "react-icons/bs";

const { Option } = Select; 

const SortProduct = ({ onSelect }) => {
    const handleChange = (value) => {
        onSelect(value); 
    };

    return (
        <div className="relative">
            <Select 
                onChange={handleChange} 
                placeholder={
                    <span className="flex items-center space-x-2">
                        <BsSortDown className="text-lg text-amber-600" />
                        <span className="font-medium text-gray-700">Sắp xếp</span>
                    </span>
                }
                className="w-56"
                bordered={false}
                suffixIcon={<span className="text-amber-600">▼</span>}
                dropdownStyle={{
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                }}
            >
                <Option value="createdAtDesc">
                    <span className="flex items-center text-gray-600 hover:text-amber-600 transition-colors">
                        Cũ nhất
                    </span>
                </Option>
                <Option value="createdAtAsc">
                    <span className="flex items-center text-gray-600 hover:text-amber-600 transition-colors">
                        Mới nhất
                    </span>
                </Option>
                <Option value="priceDesc">
                    <span className="flex items-center text-gray-600 hover:text-amber-600 transition-colors">
                        Giá giảm dần
                    </span>
                </Option>
                <Option value="priceAsc">
                    <span className="flex items-center text-gray-600 hover:text-amber-600 transition-colors">
                        Giá tăng dần
                    </span>
                </Option>
                <Option value="soldDesc">
                    <span className="flex items-center text-gray-600 hover:text-amber-600 transition-colors">
                        Số lượng bán giảm dần
                    </span>
                </Option>
                <Option value="soldAsc">
                    <span className="flex items-center text-gray-600 hover:text-amber-600 transition-colors">
                        Số lượng bán tăng dần
                    </span>
                </Option>
                <Option value="rateDesc">
                    <span className="flex items-center text-gray-600 hover:text-amber-600 transition-colors">
                        Đánh giá giảm dần
                    </span>
                </Option>
                <Option value="rateAsc">
                    <span className="flex items-center text-gray-600 hover:text-amber-600 transition-colors">
                        Đánh giá tăng dần
                    </span>
                </Option>
            </Select>

            {/* Custom styles for Ant Design Select */}
            <style jsx global>{`
                .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                    background-color: #f8fafc;
                    border-radius: 9999px;
                    padding: 4px 16px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    transition: all 0.3s ease;
                }

                .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
                    background-color: #f1f5f9;
                }

                .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
                    box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.1);
                }

                .ant-select-item {
                    padding: 8px 16px;
                    border-radius: 8px;
                    margin: 2px 0;
                    transition: all 0.2s ease;
                }

                .ant-select-item:hover {
                    background-color: #fef3c7;
                }

                .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
                    background-color: #fef3c7;
                    font-weight: 500;
                }

                .ant-select-dropdown {
                    padding: 8px;
                    border-radius: 16px;
                }
            `}</style>
        </div>
    );
};

export default SortProduct;
