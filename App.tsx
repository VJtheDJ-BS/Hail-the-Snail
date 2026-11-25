import { useMemo, useState } from 'react'
import { ArrowUpRight, Search, ShoppingBag, X, Plus, Minus, Menu, Sparkles, UserRound, PackageCheck } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

type Product = { id: string; name: string; category: string; price: number; description: string; image: string; tag?: string }

const products: Product[] = [
  { id: 'arc-speaker', name: 'Arc Speaker', category: 'Technology', price: 89, description: 'Room-filling sound. Quietly considered design.', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=85', tag: 'Bestseller' },
  { id: 'form-bottle', name: 'Form Bottle', category: 'Everyday', price: 32, description: 'A better daily ritual, made to go everywhere.', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=85', tag: 'New' },
  { id: 'studio-bag', name: 'Studio Bag', category: 'Accessories', price: 64, description: 'A versatile carry-all with a clean silhouette.', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85' },
  { id: 'daily-watch', name: 'Daily Watch', category: 'Accessories', price: 119, description: 'Minimal details. Made for every day.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85' },
]

type Cart = Record<string, number>
export default function App() {
  const [cart, setCart] = useState<Cart>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [notice, setNotice] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [email, setEmail] = useState('')
  const [authOpen, setAuthOpen] = useState(false)

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]
  const visible = useMemo(() => products.filter(p =>
    (category === 'All' || p.category === category) &&
    `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query.toLowerCase())
  ), [category, query])
  const count = Object.values(cart).reduce((a, b) => a + b, 0)
  const total = products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0)
  const add = (id: string) => { setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 })); setNotice('Added to your bag') }
  const change = (id: string, delta: number) => setCart(c => {
    const next = { ...c, [id]: Math.max(0, (c[id] || 0) + delta) }
    if (!next[id]) delete next[id]
    return next
  })

  async function signIn() {
    if (!supabase) { setNotice('Connect Supabase in .env to enable accounts.'); return }
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    setNotice(error ? error.message : 'Check your email for your sign-in link.')
  }

  async function checkout() {
    if (!supabase) { setNotice('Checkout is not connected yet. Follow the setup guide to connect the secure backend.'); return }
    const items = Object.entries(cart).filter(([, quantity]) => quantity > 0).map(([product_id, quantity]) => ({ product_id, quantity }))
    const { data, error } = await supabase.functions.invoke('create-checkout', { body: { items } })
    if (error || !data?.url) { setNotice(error?.message || 'Unable to start checkout.'); return }
    window.location.assign(data.url)
  }

  return <div className="site-shell">
    <div className="announcement">A little more considered. A little more ARLEX. <span>Discover the collection ↗</span></div>
    <header className="nav-wrap">
      <nav className="nav glass">
        <button className="icon-btn mobile-only" aria-label="Open menu" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={19}/></button>
        <a className="wordmark" href="#">ARLEX<span>®</span></a>
        <div className={`nav-links ${mobileMenu ? 'show' : ''}`}>
          <a href="#shop" onClick={() => setMobileMenu(false)}>Shop</a><a href="#story" onClick={() => setMobileMenu(false)}>Our approach</a><a href="#footer" onClick={() => setMobileMenu(false)}>Contact</a>
        </div>
        <div className="nav-actions">
          <button className="icon-btn" aria-label="Account" onClick={() => setAuthOpen(true)}><UserRound size={19}/></button>
          <button className="bag-btn" onClick={() => setCartOpen(true)}><ShoppingBag size={18}/><span>Bag</span><b>{count}</b></button>
        </div>
      </nav>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/> THE ARLEX EDITION — 001</div>
          <h1>Everyday,<br/><em>elevated.</em></h1>
          <p>Thoughtful objects. Clean lines. A better kind of everyday.</p>
          <a className="primary-btn" href="#shop">Explore the collection <ArrowUpRight size={17}/></a>
          <div className="hero-foot"><span>01 / 04</span><span>DESIGNED FOR DAILY LIFE</span></div>
        </div>
        <div className="hero-art">
          <img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1500&q=90" alt="Minimal calm interior with carefully selected everyday objects"/>
          <div className="floating-note glass"><Sparkles size={16}/><span>Less, but better.</span></div>
          <div className="image-index">ARLEX / OBJECTS & FORM</div>
        </div>
      </section>

      <section className="ticker"><span>GOOD DESIGN, EVERY DAY</span><i>✳</i><span>MADE TO BE USED</span><i>✳</i><span>KEEP IT SIMPLE</span><i>✳</i><span>GOOD DESIGN, EVERY DAY</span></section>

      <section className="shop-section" id="shop">
        <div className="section-heading">
          <div><div className="eyebrow">THE COLLECTION</div><h2>Find your <em>everyday.</em></h2></div>
          <p>Useful things, thoughtfully chosen.<br/>Meet the first ARLEX collection.</p>
        </div>
        <div className="shop-tools">
          <div className="filters">{categories.map(c => <button key={c} className={category === c ? 'filter active' : 'filter'} onClick={() => setCategory(c)}>{c}</button>)}</div>
          <label className="search glass"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the collection"/></label>
        </div>
        <div className="product-grid">
          {visible.map((p, i) => <article className="product-card" key={p.id}>
            <div className="product-image"><img src={p.image} alt={p.name}/>{p.tag && <span className="product-tag glass">{p.tag}</span>}<button className="quick-add" onClick={() => add(p.id)} aria-label={`Add ${p.name} to bag`}><Plus size={19}/></button></div>
            <div className="product-meta"><div><h3>{p.name}</h3><p>{p.description}</p></div><strong>£{p.price.toFixed(2)}</strong></div>
            <span className="product-category">{p.category.toUpperCase()}</span>
          </article>)}
          {visible.length === 0 && <div className="empty-state">No products found. Try another search.</div>}
        </div>
      </section>

      <section className="manifesto" id="story"><div className="manifesto-image"><img src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1200&q=85" alt="Minimal product and interior styling"/></div><div className="manifesto-copy"><div className="eyebrow">A NOTE FROM ARLEX</div><h2>Make room for<br/><em>what matters.</em></h2><p>ARLEX is a brand built around a simple idea: the things we use every day should feel considered. Start with less. Choose well. Make it last.</p><a href="#shop" className="text-link">Explore ARLEX <ArrowUpRight size={16}/></a></div></section>

      <section className="newsletter"><div className="eyebrow">THE ARLEX LETTER</div><h2>Good things, <em>occasionally.</em></h2><p>New releases, considered ideas and the occasional note from us.</p><form onSubmit={e => {e.preventDefault(); setNotice('Newsletter signup will be connected when the backend is configured.')}}><input type="email" required placeholder="Your email address"/><button type="submit">Sign me up <ArrowUpRight size={16}/></button></form></section>
    </main>

    <footer id="footer"><a className="wordmark" href="#">ARLEX<span>®</span></a><span>© 2026 ARLEX. Made with intention.</span><div><a href="#footer">Instagram</a><a href="mailto:hello@arlex.example">Contact</a></div></footer>

    {cartOpen && <div className="overlay" onMouseDown={e => {if (e.target === e.currentTarget) setCartOpen(false)}}><aside className="drawer"><div className="drawer-head"><div><div className="eyebrow">YOUR SELECTION</div><h2>Your bag <span>({count})</span></h2></div><button className="icon-btn" onClick={() => setCartOpen(false)}><X/></button></div>
      {count === 0 ? <div className="empty-bag"><ShoppingBag size={34}/><h3>Your bag is taking a breather.</h3><p>Find something you love in the collection.</p><button className="primary-btn" onClick={() => setCartOpen(false)}>Continue shopping</button></div> : <>
        <div className="cart-lines">{products.filter(p => cart[p.id]).map(p => <div className="cart-line" key={p.id}><img src={p.image} alt=""/><div className="cart-info"><b>{p.name}</b><span>£{p.price.toFixed(2)}</span><div className="quantity"><button onClick={() => change(p.id,-1)}><Minus size={13}/></button><span>{cart[p.id]}</span><button onClick={() => change(p.id,1)}><Plus size={13}/></button></div></div></div>)}</div>
        <div className="cart-bottom"><div className="subtotal"><span>Subtotal</span><b>£{total.toFixed(2)}</b></div><p>Shipping and taxes calculated at checkout.</p><button className="checkout-btn" onClick={checkout}>Continue to secure checkout <ArrowUpRight size={17}/></button></div>
      </>}</aside></div>}

    {authOpen && <div className="overlay" onMouseDown={e => {if (e.target === e.currentTarget) setAuthOpen(false)}}><div className="auth-modal"><button className="icon-btn close-modal" onClick={() => setAuthOpen(false)}><X/></button><div className="eyebrow">WELCOME TO ARLEX</div><h2>Your account,<br/><em>your ARLEX.</em></h2><p>Enter your email and we'll send you a secure sign-in link.</p><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"/><button className="checkout-btn" onClick={signIn}>Email me a sign-in link <ArrowUpRight size={16}/></button></div></div>}

    {notice && <button className="toast glass" onClick={() => setNotice('')}>{notice}<X size={14}/></button>}
  </div>
}
