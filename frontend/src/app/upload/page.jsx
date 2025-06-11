'use client';

import { useState } from 'react';
import {
  Upload,
  Button,
  Input,
  message,
  Table,
  Typography,
  Row,
  Col,
  Space,
  Divider,
} from 'antd';
import { UploadOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [hesapKodu, setHesapKodu] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (info) => {
    setFile(info.file);
  };

  const handleFileUpload = async () => {
    if (!file) {
      message.warning('Lütfen bir dosya seçin.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file.originFileObj || file);

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/upload', formData);
      if (res.status === 200) {
        message.success('Dosya başarıyla yüklendi.');
      } else {
        message.error('Yükleme sırasında hata oluştu.');
      }
    } catch (err) {
      message.error('Yükleme hatası: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetData = async () => {
    if (!hesapKodu) {
      message.warning('Lütfen bir hesap kodu girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/get-data', {
        codes: [hesapKodu],
      });

      if (res.status === 200) {
        setData(res.data);
        message.success('Veri başarıyla alındı.');
      } else {
        message.error('Veri alınamadı.');
      }
    } catch (err) {
      message.error('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = data.length
    ? Object.keys(data[0]).map((key) => ({
        title: key,
        dataIndex: key,
        key,
      }))
    : [];

  return (
    <div style={{ padding: 40 }}>
      <Title level={3}>e-Beyanname – Excel Yükleme ve Hesap Kodu Sorgulama</Title>

      <Row gutter={24}>
        {/* Sol Taraf: Dosya Yükleme */}
        <Col xs={24} md={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5}>1. Excel Yükleme</Title>
            <Upload beforeUpload={() => false} onChange={handleFileChange} maxCount={1}>
              <Button icon={<UploadOutlined />}>Dosya Seç</Button>
            </Upload>
            <Button type="primary" onClick={handleFileUpload} loading={loading}>
              Yükle
            </Button>
          </Space>
        </Col>

        {/* Sağ Taraf: Hesap Kodu Arama */}
        <Col xs={24} md={12}>
          <Space direction="vertical" style={{ width: 250}}>
            <Title level={5}>2. Hesap Kodu Sorgulama</Title>
            <Input.Search
              placeholder="Hesap Kodu Giriniz"
              enterButton={<SearchOutlined />}
              size="middle"
              value={hesapKodu}
              width="10px"
              onChange={(e) => setHesapKodu(e.target.value)}
              onSearch={handleGetData}
              loading={loading}
            />
          </Space>
        </Col>
      </Row>

      <Divider />

      {/* Tablo */}
      {data.length > 0 && (
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(row, index) => index}
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
}
