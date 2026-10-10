import { Input, Space } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import OrganizationsService from "../../../api/services/organizations-service";

export const OrganizationsDialog = ({
    visible,
    onOk,
    onCancel,
    currentRecord,
    ...props
}) => {
    const [organization, setOrganization] = useState(null);

    useEffect(() => {
        if (currentRecord) {
            setOrganization(currentRecord);
        } else {
            setOrganization(null);
        }
    }, [currentRecord])

    const onOkHandler = async () => {
        const record =
            currentRecord
                ? await OrganizationsService.updateRecord({
                    id: currentRecord.id,
                    ...organization,
                })
                : await OrganizationsService.createRecord(organization)
        onOk(record);
    }

    return (
        <Modal
            visible={visible}
            title={currentRecord ? 'Редактировать' : 'Создать'}
            onOk={onOkHandler}
            onCancel={onCancel}
        >

            <Space direction="middle">

                <Space>
                    <Input
                        value={organization?.title || ''}
                        onChange={e => setOrganization({ ...organization, title: e.target.value })}
                        placeholder="Укажите наименование организации"
                    />

                    <Input
                        value={organization?.inn || ''}
                        onChange={e => setOrganization({ ...organization, inn: e.target.value })}
                        placeholder="Укажите ИНН организации"
                    />

                </Space>


            </Space>
        </Modal>
    )
}