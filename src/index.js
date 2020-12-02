import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";
import "./index.css";
import { Table } from "antd";
import { Resizable } from "react-resizable";

const data = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
    children: [
      {
        key: 11,
        name: "John Brown",
        age: 42,
        address: "New York No. 2 Lake Park",
        children: [
          {
            key: 111,
            name: "John Brown",
            age: 42,
            address: "New York No. 2 Lake Park",
            children: [
              {
                key: 1111,
                name: "John Brown",
                age: 42,
                address: "New York No. 2 Lake Park"
              }
            ]
          }
        ]
      }
    ]
  });
}

const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;
  console.log("width", width);

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

class Demo extends React.Component {
  state = {
    columns: [
      {
        title: "Full Name",
        width: 100,
        dataIndex: "name",
        key: "name",
        fixed: "left"
      },
      {
        title: "Age",
        width: 100,
        dataIndex: "age",
        key: "age",
        fixed: "left"
      },
      {
        title: "Column 1",
        dataIndex: "address",
        key: "1",
        width: 150
      },
      {
        title: "Column 2",
        dataIndex: "address",
        key: "2",
        width: 150
      },
      {
        title: "Column 3",
        dataIndex: "address",
        key: "3",
        width: 150
      },
      {
        title: "Column 4",
        dataIndex: "address",
        key: "4",
        width: 150
      },
      { title: "Column 8", dataIndex: "address", key: "8" },
      {
        title: "Action",
        key: "operation",
        width: 100,
        render: () => <a>action</a>
      }
    ]
  };

  components = {
    header: {
      cell: ResizableTitle
    }
  };

  data = data;

  handleResize = (index) => (e, resizeObj) => {
    console.log("resizeObj: ", resizeObj);
    const { size } = resizeObj;
    this.setState(({ columns }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width
      };
      return { columns: nextColumns };
    });
  };

  render() {
    const columns = this.state.columns.map((col, index) => ({
      ...col,
      onHeaderCell: (column) => ({
        width: column.width,
        onResize: this.handleResize(index)
      })
    }));

    return (
      <Table
        bordered
        scroll={{ x: 1500, y: 300 }}
        components={this.components}
        columns={columns}
        dataSource={this.data}
      />
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById("container"));
