import { Select } from "antd";

const { Option } = Select; 

const SortProduct = ({ onSelect }) => {
    const handleChange = (value) => {
        onSelect(value); 
    };

    return(
        <Select onChange={handleChange} placeholder={<span style={{ fontWeight: 'bold', color: 'black' }}>Sắp xếp</span>}  className="w-48">
            <Option value="">Mạc định</Option>
            <Option value="createdAtDesc">Cũ nhất</Option>
            <Option value="createdAtAsc">Mới nhất </Option>
            <Option value="priceDesc">Giá giảm dần</Option>
            <Option value="priceAsc">Giá tăng dần</Option>
            <Option value="soldDesc">Số lượng bán giảm dần</Option>
            <Option value="soldAsc">Số lượng bán tăng dần</Option>
            <Option value="rateDesc">Đánh giá giảm dần</Option>
            <Option value="rateAsc">Đánh giá tăng dần</Option>
        </Select>
    );
};

export default SortProduct;
