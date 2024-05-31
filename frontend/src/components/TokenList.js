import React from "react";
import { List, Avatar } from "antd";
import logo from "../assets/noImg.png";

const TokenList = ({ tokens }) => (
  <List
    bordered
    itemLayout="horizontal"
    dataSource={tokens}
    renderItem={(item, index) => (
      <List.Item style={{ textAlign: "left" }}>
        <List.Item.Meta
          avatar={<Avatar src={item.logo || logo} />}
          title={item.symbol}
          description={item.name}
        />
        <div>
          {(Number(item.balance) / 10 ** Number(item.decimals)).toFixed(5)} Tokens
        </div>
      </List.Item>
    )}
  />
);

export default TokenList;
