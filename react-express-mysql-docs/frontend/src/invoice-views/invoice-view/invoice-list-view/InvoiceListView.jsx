import React, { useEffect, useState } from "react";
import InvoiceHeaderService from "../../../api/invoice-services/invoice-header-service";
import CorrespondentService from "../../../api/invoice-services/correspondent-service";
import OrganizationsService from "../../../api/invoice-services/organizations-service";
import dayjs from "dayjs";
import { Space, Table, Button, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { InvoiceHeadersDialog } from "../../../components/invoice-dialogs/invoice-headers-dialog/InvoiceHeadersDialog";

export const InvoiceListView = () => {
  const [list, setList] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [visible, setVisible] = useState(false);
  const [correspondents, setCorrespondents] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const navigate = useNavigate();

  // Колонки таблицы
  const columns = [
    {
      title: "Код",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Номер",
      dataIndex: "operationCode",
      key: "operationCode",
    },
    {
      title: "Дата поступления аванса",
      dataIndex: "date",
      key: "date",
      render: (text) => (text ? dayjs(text).format("DD.MM.YYYY") : "—"),
    },
    {
      title: "Дата сдачи отчета",
      dataIndex: "datelast",
      key: "datelast",
      render: (text) => (text ? dayjs(text).format("DD.MM.YYYY") : "—"),
    },
    {
      title: "ФИО бухгалтера",
      dataIndex: "senderID",
      key: "senderID",
      render: (text, record) =>
        organizations.find((it) => it.id === record.senderID)?.activity || "—",
    },
    {
      title: "Организация",
      dataIndex: "recipientId",
      key: "recipientId",
      render: (text, record) =>
        organizations.find((it) => it.id === record.recipientId)?.name || "—",
    },
    {
      title: "Действия",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => updateRecordHandler(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => deleteRecordHandler(record.id)}
          />
        </Space>
      ),
    },
  ];

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [correspondentsData, organizationsData, listData] = await Promise.all([
          CorrespondentService.getAllRecords(),
          OrganizationsService.getAllRecords(),
          InvoiceHeaderService.getAllRecords(),
        ]);
        setCorrespondents(correspondentsData);
        setOrganizations(organizationsData);
        setList(listData);
      } catch (error) {
        message.error("Произошла ошибка при загрузке данных: " + error.message);
      }
    };

    fetchData();
  }, []);

  // Создание записи
  const createRecordHandler = () => {
    setCurrentRecord(null);
    setVisible(true);
  };

  // Обновление записи
  const updateRecordHandler = (record) => {
    setCurrentRecord(record);
    setVisible(true);
  };

  // Удаление записи
  const deleteRecordHandler = async (recordId) => {
    try {
      await InvoiceHeaderService.removeRecord(recordId);
      setList((prevList) => prevList.filter((it) => it.id !== recordId));
      message.success("Запись успешно удалена.");
    } catch (error) {
      message.error("Произошла ошибка при удалении записи: " + error.message);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: 16,
          fontSize: 48,
        }}
      >
        Журнал накладных на перемещение материальных ценностей
      </div>
      <Table
        dataSource={list}
        columns={columns}
        // rowKey={(record) => record.id || Math.random()} // Предохранение от отсутствия `id`
        onRow={(record, rowIndex) => ({
          onDoubleClick: event => {
              navigate(`/invoice-body/${record.id}`);
          },
      })}
      />
      <Button onClick={createRecordHandler} style={{ marginTop: 16 }} type="primary">
        Создать
      </Button>
      <InvoiceHeadersDialog
        visible={visible}
        onOk={(record) => {
          if (currentRecord) {
            setList(list.map(it => it.id === currentRecord.id ? { ...record } : it));
            message.success("Запись успешно отредактирована.");
          } else {
            setList([...list, record]);
            message.success("Запись успешно добавлена.");
          }
          setCurrentRecord(null);
          setVisible(false);
        }}
        onCancel={() => {
          setVisible(false);
        }}
        currentRecord={currentRecord}
        correspondents={correspondents}
        organizations={organizations}
      />
    </div>
  );
};
