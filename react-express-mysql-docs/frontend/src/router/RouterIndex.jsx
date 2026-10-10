import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AssetsView } from "../invoice-views/assets-view/AssetsView"; // Добавьте нужный импорт
import { CorrespondentView } from "../invoice-views/correspondent-view/CorrespondentView"; // Добавьте нужный импорт
import { OrganizationsDBView } from "../invoice-views/organizations-view/OrganizationsDBView"; // Добавьте нужный импорт
import { InvoiceListView } from "../invoice-views/invoice-view/invoice-list-view/InvoiceListView"; // Добавьте нужный импорт
import { InvoiceView } from "../invoice-views/invoice-view/invoice-view/InvoiceView"; // Добавьте нужный импорт
import { IndividualsView } from "../views/individuals-view/IndividualsView";
import { OrganizationsView } from "../views/organizations-view/OrganizationsView";
import { ProductView } from "../views/product-view/ProductView";
import { ProxyListView } from "../views/proxy-view/proxy-list-view/ProxyListView";
import { ProxyView } from "../views/proxy-view/proxy-view/ProxyView";
import { ProxyCreateView } from "../views/proxy-view/proxy-view/ProxyCreateView";
import { Navigation } from "../components/navigation/Navigation";
import { ROUTE_PATHS } from "./paths";

export const RouterIndex = (props) => {
    return (
        <BrowserRouter>
            <Navigation>
                <Routes>
                    <Route path="/" element={<ProxyListView />} />
                    <Route path={ROUTE_PATHS.product} element={<ProductView />} />
                    <Route path={ROUTE_PATHS.individuals} element={<IndividualsView />} />
                    <Route path={ROUTE_PATHS.organizations} element={<OrganizationsView />} />
                    <Route path={ROUTE_PATHS.proxy.list} element={<ProxyListView />} />
                    <Route path={ROUTE_PATHS.proxy.proxy} element={<ProxyView />} />
                    <Route path={ROUTE_PATHS.create} element={<ProxyCreateView />} />
                    <Route path={ROUTE_PATHS.assets} element={<AssetsView />} /> 
                    <Route path={ROUTE_PATHS.correspondent} element={<CorrespondentView />} /> 
                    <Route path={ROUTE_PATHS.organizationsDB} element={<OrganizationsDBView />} /> 
                    <Route path={ROUTE_PATHS.invoiceHeaders} element={<InvoiceListView />} /> 
                    <Route path={ROUTE_PATHS.invoiceHeadersId} element={<InvoiceView />} /> 
                </Routes>
            </Navigation>
        </BrowserRouter>
    );
};
