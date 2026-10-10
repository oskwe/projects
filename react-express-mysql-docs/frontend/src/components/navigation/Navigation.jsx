import React from "react";
import { Menu } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../router/paths";
import styles from './style.module.css';

export const Navigation = ({ children }) => {
    return (
        <div>
            <Menu
                mode="horizontal"
                theme="dark"
                defaultSelectedKeys={['menu-1']}
                inlineIndent={2000}
            >
                <SubMenu  title="Документы" key="sub-1">
                    <div class='menu-item'>
                    <Menu.Item key="menu-1" className={styles["menu-item"]}>
                        <Link to={ROUTE_PATHS.proxy.list}>
                            Доверенность
                        </Link>
                    </Menu.Item>
                        <Menu.Item key="menu-2" className={styles["menu-item"]}>
                        <Link to={ROUTE_PATHS.invoiceHeaders}>
                            Накладные
                        </Link>
                    </Menu.Item>
                    </div>
                </SubMenu>
                <SubMenu title="Справочники" key="sub-2">
                    <div class='menu-item'>
                    <Menu.Item key="menu-3"  className={styles["menu-item"]}>
                        <Link to={ROUTE_PATHS.individuals} className={styles["link-item"]}>
                            Физические лица
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="menu-4" className={styles["menu-item"]}>
                        <Link to={ROUTE_PATHS.organizations} className={styles["link-item"]}>
                            Организации
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="menu-5" className={styles["menu-item"]}>
                        <Link to={ROUTE_PATHS.product} className={styles["link-item"]}>
                            Товары
                        </Link>
                    </Menu.Item>
                    {/* <Menu.Item key="menu-6" className={styles["menu-item"]}>
                        <Link to={ROUTE_PATHS.assets} className={styles["link-item"]}>
                            Материальные ценности
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="menu-7" className={styles["menu-item"]}>
                        <Link to={ROUTE_PATHS.correspondent} className={styles["link-item"]}>
                            Корреспондирующий счет
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="menu-8" className={styles["menu-item"]}>
                        <Link to={ROUTE_PATHS.organizationsDB} className={styles["link-item"]}>
                            Организации 2
                        </Link>
                    </Menu.Item> */}
                    </div>
                </SubMenu>

                <Menu.Item >
                    <Link to={ROUTE_PATHS.proxy.list}>
                        Выход
                    </Link>
                </Menu.Item>
            </Menu>

            {children}
        </div>
    );
};
