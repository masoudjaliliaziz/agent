import * as React from "react";
import styles from "./AgentForm.module.scss";
import { IAgentFormProps, IAgentFormState } from "./IAgentFormProps";
import Form from "./Form/Form";
import { loadDistributerCodeFromOrder, loadOrdersByGuid } from "./Crud/GetData";
require("./Styles/font.css");

export default class AgentForm extends React.Component<IAgentFormProps, any> {
  constructor(props: IAgentFormProps) {
    super(props);
    this.state = {
      parent_GUID: "",
      existLink: "",
      formKey: 0,
    };
    this.handleFormRefresh = this.handleFormRefresh.bind(this);
  }

  async componentDidMount() {
    let guidFromUrl = "";
    const hash = window.location.hash;

    if (hash) {
      const hashParams = new URLSearchParams(hash.replace("#/?", ""));
      const guid = hashParams.get("guid");

      if (guid) {
        guidFromUrl = guid;
        sessionStorage.setItem("agent_guid", guid);
        this.setState({ parent_GUID: guid });
        const currentOrderLink = await loadOrdersByGuid(guid);
        this.setState({ existLink: currentOrderLink });

        return;
      }
    }

    const guidFromStorage = sessionStorage.getItem("agent_guid");
    if (guidFromStorage) {
      this.setState({ parent_GUID: guidFromStorage });
      const currentOrderLink = await loadOrdersByGuid(guidFromStorage);
      this.setState({ existLink: currentOrderLink });
    }
  }
  handleFormRefresh() {
    this.setState({ formKey: this.state.formKey + 1 }, async () => {
      // بعد از رفرش فرم، لینک رو مجدد لود کن
      if (this.state.parent_GUID) {
        const currentOrderLink = await loadOrdersByGuid(this.state.parent_GUID);
        this.setState({ existLink: currentOrderLink });
      }
    });
  }
  public render(): React.ReactElement<IAgentFormProps> {
    return (
      <div className={styles.agentForm}>
        <div className={styles.container}>
          <Form
            key={this.state.formKey} // 🔑 کلید که فرم رو مجدد رندر می‌کنه
            existLink={this.state.existLink}
            parent_GUID={this.state.parent_GUID}
            distributerCode={this.props.distributerCode}
            onRefresh={this.handleFormRefresh} // 🔁 ارسال متد رفرش به فرم
          />
        </div>
      </div>
    );
  }
}
