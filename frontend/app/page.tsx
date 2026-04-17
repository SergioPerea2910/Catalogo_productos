"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

type Product = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type HealthStatus = {
  status: string;
  message: string;
};

type FormState = {
  sku: string;
  name: string;
  description: string;
  price: string;
  type: string;
  is_active: boolean;
};

type ValidationErrors = Record<string, string[]>;

const INITIAL_FORM: FormState = {
  sku: "",
  name: "",
  description: "",
  price: "",
  type: "curso",
  is_active: true,
};

const PRODUCT_TYPES = [
  "curso",
  "ebook",
  "suscripcion",
  "software",
  "plantilla",
];

function formatPrice(value: number) {
  return `$ ${value.toFixed(2)}`;
}

function createFormFromProduct(product: Product): FormState {
  return {
    sku: product.sku,
    name: product.name,
    description: product.description ?? "",
    price: product.price.toString(),
    type: product.type,
    is_active: product.is_active,
  };
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadHealth();
    void loadProducts();
  }, []);

  async function loadHealth() {
    try {
      const response = await fetch("/api/health", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No fue posible verificar el backend.");
      }

      const data = (await response.json()) as HealthStatus;
      setHealth(data);
    } catch (loadError) {
      setHealth({
        status: "error",
        message:
          loadError instanceof Error
            ? loadError.message
            : "Backend no disponible.",
      });
    }
  }

  async function loadProducts() {
    setLoadingProducts(true);

    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No fue posible cargar productos.");
      }

      setProducts(data as Product[]);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar productos.",
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setValidationErrors({});
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = event.target;
    const nextValue =
      type === "checkbox" && event.target instanceof HTMLInputElement
        ? event.target.checked
        : value;

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFeedback(null);
    setValidationErrors({});

    const payload = {
      ...form,
      price: Number(form.price),
    };

    try {
      const response = await fetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          setValidationErrors(data.errors as ValidationErrors);
          setError("Revisa los campos marcados para continuar.");
          return;
        }

        throw new Error(data.message ?? "No fue posible guardar el producto.");
      }

      setFeedback(
        editingId
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente.",
      );

      resetForm();
      await loadProducts();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No fue posible guardar el producto.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDisable(product: Product) {
    const isConfirmed = window.confirm(
      `Vas a inhabilitar "${product.name}".`,
    );

    if (!isConfirmed) {
      return;
    }

    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "No fue posible inhabilitar el producto.",
        );
      }

      if (editingId === product.id) {
        resetForm();
      }

      setFeedback("Producto inhabilitado correctamente.");
      await loadProducts();
    } catch (disableError) {
      setError(
        disableError instanceof Error
          ? disableError.message
          : "No fue posible inhabilitar el producto.",
      );
    }
  }

  function beginEdit(product: Product) {
    setEditingId(product.id);
    setForm(createFormFromProduct(product));
    setValidationErrors({});
    setError(null);
    setFeedback(`Editando ${product.name}.`);
  }

  return (
    <main className={styles.page}>
      <section className={styles.overview}>
        <div className={styles.overviewCopy}>
          <div>
            <p className={styles.eyebrow}>Panel del catalogo digital</p>
            <h1>Administra productos activos desde una sola vista.</h1>
            <p className={styles.description}>
              Crea, actualiza e inhabilita productos sin exponer la API key del
              backend en el navegador.
            </p>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Backend</span>
              <strong
                className={
                  health?.status === "ok"
                    ? styles.metricValueSuccess
                    : styles.metricValueWarning
                }
              >
                {health?.status === "ok" ? "Conectado" : "Pendiente"}
              </strong>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Productos activos</span>
              <strong className={styles.metricValue}>{products.length}</strong>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Modo</span>
              <strong className={styles.metricValue}>
                {editingId ? "Edicion" : "Creacion"}
              </strong>
            </div>
          </div>
        </div>

        <div className={styles.overviewMedia}>
          <Image
            alt="Persona administrando productos digitales desde un escritorio"
            fill
            priority
            sizes="(max-width: 960px) 100vw, 420px"
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
          />
        </div>
      </section>

      <section className={styles.workspace}>
        <section className={styles.editorPane}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Formulario</p>
              <h2>{editingId ? "Editar producto" : "Crear producto"}</h2>
            </div>
            {editingId ? (
              <button
                className={styles.secondaryButton}
                onClick={resetForm}
                type="button"
              >
                Cancelar
              </button>
            ) : null}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>SKU</span>
              <input
                name="sku"
                onChange={handleInputChange}
                placeholder="PROD-001"
                type="text"
                value={form.sku}
              />
              {validationErrors.sku ? (
                <small>{validationErrors.sku[0]}</small>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Nombre</span>
              <input
                name="name"
                onChange={handleInputChange}
                placeholder="Curso Laravel"
                type="text"
                value={form.name}
              />
              {validationErrors.name ? (
                <small>{validationErrors.name[0]}</small>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Descripcion</span>
              <textarea
                name="description"
                onChange={handleInputChange}
                placeholder="Describe el producto para quien lo vaya a comprar."
                rows={4}
                value={form.description}
              />
              {validationErrors.description ? (
                <small>{validationErrors.description[0]}</small>
              ) : null}
            </label>

            <div className={styles.inlineFields}>
              <label className={styles.field}>
                <span>Precio</span>
                <input
                  min="0"
                  name="price"
                  onChange={handleInputChange}
                  placeholder="49.99"
                  step="0.01"
                  type="number"
                  value={form.price}
                />
                {validationErrors.price ? (
                  <small>{validationErrors.price[0]}</small>
                ) : null}
              </label>

              <label className={styles.field}>
                <span>Tipo</span>
                <select name="type" onChange={handleInputChange} value={form.type}>
                  {PRODUCT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {validationErrors.type ? (
                  <small>{validationErrors.type[0]}</small>
                ) : null}
              </label>
            </div>

            <label className={styles.checkboxRow}>
              <input
                checked={form.is_active}
                name="is_active"
                onChange={handleInputChange}
                type="checkbox"
              />
              <span>Producto activo</span>
            </label>

            {error ? <p className={styles.feedbackError}>{error}</p> : null}
            {feedback ? <p className={styles.feedbackSuccess}>{feedback}</p> : null}

            <button className={styles.primaryButton} disabled={submitting} type="submit">
              {submitting
                ? "Guardando..."
                : editingId
                  ? "Actualizar producto"
                  : "Crear producto"}
            </button>
          </form>
        </section>

        <section className={styles.listPane}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Catalogo</p>
              <h2>Productos activos</h2>
            </div>
            <button
              className={styles.secondaryButton}
              onClick={() => void loadProducts()}
              type="button"
            >
              Recargar
            </button>
          </div>

          {loadingProducts ? (
            <p className={styles.emptyState}>Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className={styles.emptyState}>
              Aun no hay productos activos. Crea el primero desde el formulario.
            </p>
          ) : (
            <ul className={styles.productList}>
              {products.map((product) => (
                <li className={styles.productRow} key={product.id}>
                  <div className={styles.productIdentity}>
                    <div className={styles.productHeading}>
                      <strong>{product.name}</strong>
                      <span className={styles.productType}>{product.type}</span>
                    </div>
                    <p>{product.description || "Sin descripcion registrada."}</p>
                    <div className={styles.productMeta}>
                      <span>{product.sku}</span>
                      <span>{formatPrice(product.price)}</span>
                    </div>
                  </div>

                  <div className={styles.productActions}>
                    <button
                      className={styles.secondaryButton}
                      onClick={() => beginEdit(product)}
                      type="button"
                    >
                      Editar
                    </button>
                    <button
                      className={styles.ghostButton}
                      onClick={() => void handleDisable(product)}
                      type="button"
                    >
                      Inhabilitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
