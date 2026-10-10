import { Input, Space } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import OrganizationsService from "../../../api/invoice-services/organizations-service";

export const OrganizationsDBDialog = ({
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
    }, [currentRecord]);

    const onOkHandler = async () => {
        const record =
            currentRecord
                ? await OrganizationsService.updateRecord({
                    id: currentRecord.id,
                    ...organization,
                })
                : await OrganizationsService.createRecord(organization);
        onOk(record);
    };

    return (
        <Modal
            visible={visible}
            title={currentRecord ? 'Редактировать' : 'Создать'}
            onOk={onOkHandler}
            onCancel={onCancel}
        >

            <Space direction="vertical">

                <Input
                    value={organization?.name || ''}
                    onChange={e => setOrganization({ ...organization, name: e.target.value })}
                    placeholder="Укажите название организации"
                />

                <Input
                    value={organization?.structDivision || ''}
                    onChange={e => setOrganization({ ...organization, structDivision: e.target.value })}
                    placeholder="Укажите структурное подразделение"
                />

                <Input
                    value={organization?.activity || ''}
                    onChange={e => setOrganization({ ...organization, activity: e.target.value })}
                    placeholder="Укажите вид деятельности"
                />

                


            </Space>
        </Modal>
    );
};