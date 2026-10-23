// src/pages/inventory/EquipmentFormPage.jsx  (HU-2 · 2.2 Nuevo / editar equipo)
import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useInventory } from '../../context/InventoryContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { CATEGORIAS, MAX_DESCRIPCION } from '../../shared/constants.js'
import { validateEquipoData, hasErrors, isUrl } from '../../shared/validators.js'
import { Field, Alert, Spinner, ConfirmDialog } from '../../components/ui.jsx'
import { NotFoundContent } from '../errors/NotFoundPage.jsx'

const EMPTY = { nombre: '', categoria: '', marca: '', modelo: '', descripcion: '', accesorios: [], fotos: [] }

export default function EquipmentFormPage() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()
  const { getEquipo, createEquipo, updateEquipo, deleteEquipo } = useInventory()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(editando)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(null) // 'borrador' | 'publicar'
  const [nuevoAccesorio, setNuevoAccesorio] = useState('')
  const [nuevaFoto, setNuevaFoto] = useState('')
  const [fotoError, setFotoError] = useState('')
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const [borrando, setBorrando] = useState(false)

  useEffect(() => {
    if (!editando) return
    getEquipo(id)
      .then((e) => setForm({
        nombre: e.nombre, categoria: e.categoria, marca: e.marca, modelo: e.modelo,
        descripcion: e.descripcion, accesorios: e.accesorios, fotos: e.fotos
      }))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [editando, id, getEquipo])

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: undefined })
  }

  function agregarAccesorio() {
    const valor = nuevoAccesorio.trim()
    if (!valor) return
    if (form.accesorios.some((a) => a.toLowerCase() === valor.toLowerCase())) {
      setErrors({ ...errors, accesorios: 'El accesorio «' + valor + '» ya está en la lista.' })
      return
    }
    setForm({ ...form, accesorios: [...form.accesorios, valor] })
    setErrors({ ...errors, accesorios: undefined })
    setNuevoAccesorio('')
  }

  function quitarAccesorio(index) {
    setForm({ ...form, accesorios: form.accesorios.filter((_, i) => i !== index) })
  }

  // No hay carga de archivos (fuera de alcance): las fotos se registran por URL
  function agregarFoto() {
    const valor = nuevaFoto.trim()
    if (!valor) return
    if (!isUrl(valor)) {
      setFotoError('Ingresa una URL válida que empiece con http:// o https://')
      return
    }
    setForm({ ...form, fotos: [...form.fotos, valor] })
    setFotoError('')
    setNuevaFoto('')
  }

  function quitarFoto(index) {
    setForm({ ...form, fotos: form.fotos.filter((_, i) => i !== index) })
  }

  function hacerPrincipal(index) {
    const fotos = [...form.fotos]
    const [foto] = fotos.splice(index, 1)
    setForm({ ...form, fotos: [foto, ...fotos] })
  }

  // Enter dentro de los campos de lista agrega el elemento en vez de enviar
  function onEnter(fn) {
    return (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        fn()
      }
    }
  }

  async function guardar(borrador) {
    const clean = {
      ...form,
      nombre: form.nombre.trim(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      descripcion: form.descripcion.trim()
    }
    const nuevos = validateEquipoData(clean, borrador, { categorias: CATEGORIAS, maxDescripcion: MAX_DESCRIPCION })
    setErrors(nuevos)
    if (hasErrors(nuevos)) return

    setSaving(borrador ? 'borrador' : 'publicar')
    try {
      const equipo = editando
        ? await updateEquipo(id, clean, { borrador })
        : await createEquipo(clean, { borrador })
      toast.success(borrador
        ? 'Borrador guardado. No se mostrará en el catálogo hasta publicarlo.'
        : editando ? 'Equipo actualizado.' : 'Equipo registrado. Ahora agrega sus unidades.')
      navigate('/manager/inventario/' + equipo.id)
    } catch (err) {
      setErrors(err.fields || {})
      toast.error(err.message)
    } finally {
      setSaving(null)
    }
  }

  async function eliminar() {
    setBorrando(true)
    try {
      await deleteEquipo(id)
      toast.success('Equipo «' + form.nombre + '» eliminado del inventario.')
      navigate('/manager/inventario')
    } catch (err) {
      toast.error(err.message)
      setBorrando(false)
      setConfirmarBorrado(false)
    }
  }

  if (notFound) return <NotFoundContent message="El equipo que intentas editar no existe." />
  if (loading) return <div className="page"><Spinner /></div>

  const totalErrores = Object.values(errors).filter(Boolean).length
  const titulo = editando ? 'Editar equipo' : 'Nuevo equipo'

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/manager/inventario">Inventario</Link> / {titulo}
      </div>
      <h1 className="page-title">{titulo}</h1>

      <form className="equipment-layout" onSubmit={(e) => { e.preventDefault(); guardar(false) }} noValidate>

        <div className="card">
          <h2 className="form-section">IDENTIFICACIÓN</h2>
          <div className="form-row-a">
            <Field label="NOMBRE DEL EQUIPO" error={errors.nombre}>
              <input name="nombre" value={form.nombre} onChange={onChange} placeholder="Analizador de redes portátil" />
            </Field>
            <Field label="CATEGORÍA" error={errors.categoria}>
              <select name="categoria" value={form.categoria} onChange={onChange}>
                <option value="">Selecciona</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="form-row-b">
            <Field label="MARCA" error={errors.marca}>
              <input name="marca" value={form.marca} onChange={onChange} placeholder="NetAlly" />
            </Field>
            <Field label="MODELO" error={errors.modelo}>
              <input name="modelo" className="mono-input" value={form.modelo} onChange={onChange} placeholder="LinkRunner AT 2000" />
            </Field>
          </div>

          <h2 className="form-section">DESCRIPCIÓN</h2>
          <Field
            error={errors.descripcion}
            help={'Máximo ' + MAX_DESCRIPCION + ' caracteres. Se muestra en la ficha pública del catálogo.'}
          >
            <textarea name="descripcion" rows="4" value={form.descripcion} onChange={onChange} aria-label="Descripción" />
          </Field>

          <h2 className="form-section">ACCESORIOS INCLUIDOS</h2>
          <ul className="chip-list">
            {form.accesorios.map((a, i) => (
              <li key={a} className="list-row">
                <span>{a}</span>
                <button type="button" className="btn-link danger" onClick={() => quitarAccesorio(i)}>Quitar</button>
              </li>
            ))}
          </ul>
          <Field error={errors.accesorios}>
            <div className="inline-add">
              <input
                placeholder="Nombre del accesorio"
                value={nuevoAccesorio}
                onChange={(e) => setNuevoAccesorio(e.target.value)}
                onKeyDown={onEnter(agregarAccesorio)}
                aria-label="Nombre del accesorio"
              />
              <button type="button" className="btn btn-secondary" onClick={agregarAccesorio}>Agregar</button>
            </div>
          </Field>
        </div>

        <div className="equipment-side">
          <div className="card">
            <h2 className="form-section">FOTOGRAFÍAS</h2>
            <div className="photo-grid">
              {form.fotos.map((url, i) => (
                <div key={url + i} className="photo-item">
                  <div className="photo photo-md">
                    <img src={url} alt={'Fotografía ' + (i + 1)} />
                    {i === 0 && <span className="photo-tag">principal</span>}
                  </div>
                  <div className="photo-actions">
                    {i === 0
                      ? <span></span>
                      : <button type="button" className="btn-link" onClick={() => hacerPrincipal(i)}>Hacer principal</button>}
                    <button type="button" className="btn-link danger" onClick={() => quitarFoto(i)}>Quitar</button>
                  </div>
                </div>
              ))}

              <div className="dropzone">
                <span>{form.fotos.length === 0 ? 'La primera fotografía será la principal' : 'Agrega otra fotografía'}</span>
                <span>JPG o PNG · encuadre cuadrado</span>
                <Field error={fotoError || errors.fotos}>
                  <div className="inline-add">
                    <input
                      type="url"
                      placeholder="https://…/foto.jpg"
                      value={nuevaFoto}
                      onChange={(e) => { setNuevaFoto(e.target.value); setFotoError('') }}
                      onKeyDown={onEnter(agregarFoto)}
                      aria-label="URL de la fotografía"
                    />
                    <button type="button" className="btn btn-secondary" onClick={agregarFoto}>Agregar</button>
                  </div>
                </Field>
              </div>
            </div>
          </div>

          {totalErrores > 0 && (
            <Alert type="danger">
              No se pudo guardar. Revisa {totalErrores} {totalErrores === 1 ? 'campo marcado' : 'campos marcados'}.
            </Alert>
          )}

          <div className="form-actions-bare">
            {editando && (
              <button type="button" className="btn-link danger" onClick={() => setConfirmarBorrado(true)} disabled={Boolean(saving)}>
                Eliminar equipo
              </button>
            )}
            <button type="button" className="btn-link" onClick={() => navigate(-1)} disabled={Boolean(saving)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => guardar(true)} disabled={Boolean(saving)}>
              {saving === 'borrador' ? 'Guardando…' : 'Guardar borrador'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={Boolean(saving)}>
              {saving === 'publicar' ? 'Guardando…' : 'Guardar equipo'}
            </button>
          </div>
        </div>
      </form>

      {confirmarBorrado && (
        <ConfirmDialog
          title="Eliminar equipo"
          message={'¿Eliminar «' + form.nombre + '» y todas sus unidades? Esta acción no se puede deshacer.'}
          confirmLabel="Eliminar equipo"
          busy={borrando}
          onConfirm={eliminar}
          onCancel={() => setConfirmarBorrado(false)}
        />
      )}
    </div>
  )
}
