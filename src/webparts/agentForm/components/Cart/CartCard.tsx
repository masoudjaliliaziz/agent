import * as React from "react";
import { CrudItemProps } from "./CartProps";
import styles from "./Cart.module.scss";
import Counter from "./Counter";
import { loadItemByCode } from "../Crud/GetData";

export default class CartCard extends React.Component<CrudItemProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      productFromStore: {},
      formIsOpen: false,
      priceText: "",
    };
  }

  async componentDidMount() {
    const { product } = this.props;
    const { codegoods } = product;
    const productFromStore = await loadItemByCode(codegoods);
    this.setState({ productFromStore });
  }

  render() {
    const { product, onDelete } = this.props;
    const { productFromStore } = this.state;
    return (
      <div className={styles.cardContainer}>
        <div className={styles.cardDescription}>
          <div className={styles.xs}>
            <p className={styles.codegoods}>
              <small>کد کالا : </small> {product.codegoods}
            </p>
            <p className={styles.titleDescription}>
              <small> نام محصول : </small>
              {product.Title}
            </p>
          </div>

          <div className={styles.actionsContainer}>
            <button
              onClick={() => onDelete(product.Id)}
              className={styles.deleteBtn}
            >
              حذف
            </button>
          </div>
        </div>
        <div className={styles.cardDescription}>
          <p className={styles.inventoryDescription}>
            <small> موجودی : </small>
            {productFromStore.Inventory}
          </p>

          <Counter Id={product.Id} onDelete={onDelete} />
          <form className={styles.priceForm}>
            <input
              defaultValue={
                productFromStore.Price !== 0 ? productFromStore.Price : null
              }
              type="text"
              onChange={(e) =>
                this.setState((prevState) => ({
                  formIsOpen: !prevState.formIsOpen,
                }))
              }
            />
            <button type="submit">ثبت قیمت</button>
          </form>
          <form className={styles.discountForm}>
            <input
              type="text"
              onChange={(e) =>
                this.setState((prevState) => ({
                  formIsOpen: !prevState.formIsOpen,
                }))
              }
            />
            <button type="submit"> ٪ تخفیف </button>
          </form>
          <form className={styles.fullPrice}>
            <input
              disabled
              type="text"
              onChange={(e) =>
                this.setState((prevState) => ({
                  formIsOpen: !prevState.formIsOpen,
                }))
              }
            />
            <button type="submit"> جمع </button>
          </form>
        </div>
      </div>
    );
  }
}
