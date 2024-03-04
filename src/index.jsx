/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import Inula from "openinula";
import ReactiveComponent from "./ReactiveComponent";
import "./index.css";
import { BrowserRouter, Link, Route, Switch } from "inula-router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SearchDialog } from "./components/SearchDialog";

function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen justify-center items-center ">
        <div className="flex-grow p-8 md:p-18 lg:p-24 xl:p-28 2xl:p-32">
          <Header />
          <SearchDialog />
        </div>
        <Footer />
      </div>
    </>
  );
}

Inula.render(<App />, document.getElementById("root"));
