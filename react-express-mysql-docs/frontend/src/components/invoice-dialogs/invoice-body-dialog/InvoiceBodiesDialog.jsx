import { Input, Space } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import InvoiceBodyService from "../../../api/invoice-services/invoice-body-service";

export const InvoiceBodiesDialog = ({
    visible,
    onOk,
    onCancel,
    currentRecord,
    invoiceHeaderId,
}) => {
    const [invoiceBody, setInvoiceBody] = useState(null);

    useEffect(() => {
        if (currentRecord) {
            setInvoiceBody(currentRecord);
        } else {
            setInvoiceBody({}); // Инициализируем пустым объектом
        }
    }, [currentRecord]);

    const onOkHandler = async () => {
        if (!invoiceBody) return;

        const record =
            currentRecord
                ? await InvoiceBodyService.updateRecord({
                    id: currentRecord.id,
                    ...invoiceBody,
                })
                : await InvoiceBodyService.createRecord({
                    ...invoiceBody,
                    invoiceHeaderId,
                });

        onOk(record);
    };

    return (
        <Modal
            visible={visible}
            title={currentRecord ? "Редактировать" : "Создать"}
            onOk={onOkHandler}
            onCancel={onCancel}
        >
            <Space direction="vertical" style={{ width: "100%" }}>

                {/* Наименование аванса */}
                <Input
                    value={invoiceBody?.ordinal || ""}
                    onChange={(e) =>
                        setInvoiceBody({ ...invoiceBody, ordinal: e.target.value })
                    }
                    placeholder="Наименование"
                />

                {/* Назначение аванса */}
                <Input
                    value={invoiceBody?.name || ""}
                    onChange={(e) =>
                        setInvoiceBody({ ...invoiceBody, name: e.target.value })
                    }
                    placeholder="Единица измерения"
                />

                {/* Сумма аванса */}
                <Input
                    value={invoiceBody?.price || ""}
                    onChange={(e) =>
                        setInvoiceBody({ ...invoiceBody, price: e.target.value })
                    }
                    placeholder="Количество"
                />

            </Space>
        </Modal>
    );
};
