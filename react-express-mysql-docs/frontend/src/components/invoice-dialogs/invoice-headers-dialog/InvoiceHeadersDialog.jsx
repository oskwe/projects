import { DatePicker, Space, Input, Select, message } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import InvoiceHeaderService from "../../../api/invoice-services/invoice-header-service";

const { Option } = Select;

export const InvoiceHeadersDialog = ({
  visible,
  onOk,
  onCancel,
  currentRecord,
  organizations = [],
}) => {
  const [invoiceHeader, setInvoiceHeader] = useState({
    date: null,
    operationCode: "",
    senderID: null,
    recipientId: null,
    datelast: null,
    // output: "",
  });

  useEffect(() => {
    if (currentRecord) {
      setInvoiceHeader({
        ...currentRecord,
        date: currentRecord.date ? dayjs(currentRecord.date) : null,
        datelast: currentRecord.datelast ? dayjs(currentRecord.datelast) : null,
      });
    } else {
      setInvoiceHeader({
        date: null,
        operationCode: "",
        senderID: null,
        recipientId: null,
        datelast: null,
        // output: "",
      });
    }
  }, [currentRecord]);

  const onOkHandler = async () => {
    try {
      const payload = {
        ...invoiceHeader,
        date: invoiceHeader.date ? invoiceHeader.date.toISOString() : null,
        datelast: invoiceHeader.datelast ? invoiceHeader.datelast.toISOString() : null,
      };

      if (!payload.date || !payload.operationCode) {
        message.error("Пожалуйста, заполните все обязательные поля.");
        return;
      }

      const record = currentRecord
        ? await InvoiceHeaderService.updateRecord({
            id: currentRecord.id,
            ...payload,
          })
        : await InvoiceHeaderService.createRecord(payload);

      onOk(record);
    } catch (error) {
      message.error("Ошибка при сохранении записи: " + error.message);
    }
  };

  return (
    <Modal
      visible={visible}
      title={currentRecord ? "Редактировать накладную" : "Создать накладную"}
      onOk={onOkHandler}
      onCancel={onCancel}
      okText={currentRecord ? "Сохранить" : "Создать"}
      cancelText="Отмена"
    >

        <Input
          value={invoiceHeader.operationCode}
          onChange={(e) =>
            setInvoiceHeader({
              ...invoiceHeader,
              operationCode: e.target.value,
            })
          }
          placeholder="Введите номер"
          style={{ width: "100%" }}
        />

      <Space direction="vertical" style={{ width: "100%" }}>
        <DatePicker
          value={invoiceHeader.date}
          onChange={(date) => setInvoiceHeader({ ...invoiceHeader, date })}
          placeholder="Укажите дату поступления аванса"
          style={{ width: "100%" }}
          format="DD.MM.YYYY"
        />

        <DatePicker
          value={invoiceHeader.datelast}
          onChange={(datelast) => setInvoiceHeader({ ...invoiceHeader, datelast })}
          placeholder="Укажите дату сдачи отчета"
          style={{ width: "100%" }}
          format="DD.MM.YYYY"
        />

        <Select
          value={invoiceHeader.senderID}
          onChange={(value) =>
            setInvoiceHeader({ ...invoiceHeader, senderID: value })
          }
          placeholder="Выберите ФИО бухгалтера"
          style={{ width: "100%" }}
        >
          {organizations.map((item) => (
            <Option key={item.id} value={item.id}>
              {item.activity}
            </Option>
          ))}
        </Select>

        <Select
          value={invoiceHeader.recipientId}
          onChange={(value) =>
            setInvoiceHeader({ ...invoiceHeader, recipientId: value })
          }
          placeholder="Выберите организацию"
          style={{ width: "100%" }}
        >
          {organizations.map((item) => (
            <Option key={item.id} value={item.id}>
              {item.name}
            </Option>
          ))}
        </Select>

        {/* <Input
          value={invoiceHeader.output}
          onChange={(e) =>
            setInvoiceHeader({ ...invoiceHeader, output: e.target.value })
          }
          placeholder="Введите учетную единицу выпуска продукции"
          style={{ width: "100%" }}
        /> */}
      </Space>
    </Modal>
  );
};