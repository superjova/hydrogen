import React from 'react';
import {CartProvider} from '../../CartProvider';
import {mountWithProviders} from '../../../utilities/tests/shopifyMount';
import {mountWithCartProvider} from '../../CartProvider/tests/utilities';

import {ProductOptionsProvider} from '../../ProductOptionsProvider';
import {AddToCartButton} from '../AddToCartButton.client';
import {getProduct, getVariant} from '../../../utilities/tests/product';

describe('AddToCartButton', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn(async (_url, _init) => {
      return {
        json: async () =>
          JSON.stringify({
            data: {},
          }),
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a button', () => {
    const product = getProduct();
    const component = mountWithProviders(
      <CartProvider>
        <ProductOptionsProvider data={product}>
          <AddToCartButton variantId="123">Add to cart</AddToCartButton>
        </ProductOptionsProvider>
      </CartProvider>
    );

    expect(component).toContainReactComponent('button', {
      children: 'Add to cart',
    });
  });

  it('allows passthrough props', () => {
    const product = getProduct();
    const component = mountWithProviders(
      <CartProvider>
        <ProductOptionsProvider data={product}>
          <AddToCartButton variantId="123" className="bg-blue-600">
            Add to cart
          </AddToCartButton>
        </ProductOptionsProvider>
      </CartProvider>
    );

    expect(component.find('button')).toHaveReactProps({
      className: 'bg-blue-600',
    });
  });

  describe('when variantId is set explicity', () => {
    it('renders a disabled button if the variantId is null', () => {
      const product = getProduct();
      const component = mountWithCartProvider(
        <ProductOptionsProvider data={product}>
          <AddToCartButton variantId={null}>Add to cart</AddToCartButton>
        </ProductOptionsProvider>
      );

      expect(component).toContainReactComponentTimes('button', 1, {
        disabled: true,
      });
    });

    it('calls linesAdd with the variantId', () => {
      const product = getProduct();
      const mockLinesAdd = jest.fn();
      const id = '123';
      const component = mountWithCartProvider(
        <ProductOptionsProvider data={product}>
          <AddToCartButton variantId={id}>Add to cart</AddToCartButton>
        </ProductOptionsProvider>,
        {linesAdd: mockLinesAdd, cart: {id: '456'}}
      );
      component.find('button')?.trigger('onClick');

      expect(mockLinesAdd).toHaveBeenCalledTimes(1);
      expect(mockLinesAdd).toHaveBeenCalledWith([
        expect.objectContaining({
          merchandiseId: id,
        }),
      ]);
    });
  });

  describe('when inside a ProductOptionsProvider', () => {
    describe('and an initialVariantId is present', () => {
      it('calls linesAdd with the initialVariantId', () => {
        const mockLinesAdd = jest.fn();
        const product = getProduct();
        const selectedVariant = product?.variants?.nodes?.[0];

        const component = mountWithCartProvider(
          <ProductOptionsProvider
            data={product}
            initialVariantId={selectedVariant?.id}
          >
            <AddToCartButton>Add to cart</AddToCartButton>
          </ProductOptionsProvider>,
          {linesAdd: mockLinesAdd, cart: {id: '456'}}
        );

        component.find('button')?.trigger('onClick');

        expect(mockLinesAdd).toHaveBeenCalledTimes(1);
        expect(mockLinesAdd).toHaveBeenCalledWith([
          expect.objectContaining({
            merchandiseId: selectedVariant?.id,
          }),
        ]);
      });
    });

    describe('and the initialVariantId is omitted', () => {
      it('calls linesAdd with the first available variant', () => {
        const mockLinesAdd = jest.fn();
        const product = getProduct({
          variants: {
            nodes: [
              getVariant({
                availableForSale: true,
                id: 'some variant id',
              }),
            ],
          },
        });

        const component = mountWithCartProvider(
          <ProductOptionsProvider data={product}>
            <AddToCartButton>Add to cart</AddToCartButton>
          </ProductOptionsProvider>,
          {linesAdd: mockLinesAdd, cart: {id: '456'}}
        );

        component.find('button')?.trigger('onClick');

        expect(mockLinesAdd).toHaveBeenCalledTimes(1);
        expect(mockLinesAdd).toHaveBeenCalledWith([
          expect.objectContaining({
            merchandiseId: 'some variant id',
          }),
        ]);
      });
    });

    describe('and the initialVariantId is explicity set to null', () => {
      it('disables the button', () => {
        const mockLinesAdd = jest.fn();
        const product = getProduct();

        const component = mountWithCartProvider(
          <ProductOptionsProvider data={product} initialVariantId={null}>
            <AddToCartButton>Add to cart</AddToCartButton>
          </ProductOptionsProvider>,
          {linesAdd: mockLinesAdd}
        );

        expect(component).toContainReactComponentTimes('button', 1, {
          disabled: true,
        });
      });
    });
  });

  describe('when the button is clicked', () => {
    it('disables the button', () => {
      const product = getProduct();
      const component = mountWithProviders(
        <CartProvider>
          <ProductOptionsProvider data={product}>
            <AddToCartButton variantId="123">Add to cart</AddToCartButton>
          </ProductOptionsProvider>
        </CartProvider>
      );

      component.find('button')?.trigger('onClick');

      expect(component).toContainReactComponentTimes('button', 1, {
        disabled: true,
      });
    });

    it('renders a message for screen readers when an accessible label is provided', () => {
      const product = getProduct();

      const component = mountWithProviders(
        <CartProvider>
          <ProductOptionsProvider data={product}>
            <AddToCartButton
              accessibleAddingToCartLabel="Adding product to your cart"
              variantId="123"
            >
              Add to cart
            </AddToCartButton>
          </ProductOptionsProvider>
        </CartProvider>
      );

      component.find('button')?.trigger('onClick');

      expect(component).toContainReactComponent('p', {
        children: 'Adding product to your cart',
      });
    });
  });

  describe('given an on click event handler', () => {
    it('calls the on click event handler', () => {
      const mockOnClick = jest.fn();
      const component = mountWithProviders(
        <CartProvider>
          <AddToCartButton onClick={mockOnClick}>Add to cart</AddToCartButton>
        </CartProvider>
      );

      component.find('button')?.trigger('onClick');

      expect(mockOnClick).toBeCalled();
    });

    it('calls the default behaviour of add lines', () => {
      const mockLinesAdd = jest.fn();
      const component = mountWithCartProvider(
        <AddToCartButton onClick={() => {}}>Add to cart</AddToCartButton>,
        {
          linesAdd: mockLinesAdd,
        }
      );

      component.find('button')?.trigger('onClick');

      expect(mockLinesAdd).toBeCalled();
    });

    describe('and event preventDefault is called', () => {
      it('calls the on click event handler without calling the default behaviour of add lines', () => {
        const mockOnClick = jest.fn((event) => {
          event.preventDefault();
        });
        const mockLinesAdd = jest.fn();
        const component = mountWithCartProvider(
          <AddToCartButton onClick={mockOnClick}>Add to cart</AddToCartButton>,
          {
            linesAdd: mockLinesAdd,
          }
        );

        component
          .find('button')
          ?.trigger('onClick', new MouseEvent('click', {cancelable: true}));

        expect(mockOnClick).toBeCalled();
        expect(mockLinesAdd).not.toBeCalled();
      });
    });

    describe('and the on click handler returns false', () => {
      it('calls the on click event handler without calling the default behaviour of add lines', () => {
        const mockOnClick = jest.fn(() => false);
        const mockLinesAdd = jest.fn();
        const component = mountWithCartProvider(
          <AddToCartButton onClick={mockOnClick}>Add to cart</AddToCartButton>,
          {
            linesAdd: mockLinesAdd,
          }
        );

        component.find('button')?.trigger('onClick');

        expect(mockOnClick).toBeCalled();
        expect(mockLinesAdd).not.toBeCalled();
      });
    });
  });
});
