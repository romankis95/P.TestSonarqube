! function(e) {
  function t(o) {
    if (n[o]) return n[o].exports;
    var r = n[o] = {
      exports: {},
      id: o,
      loaded: !1
    };
    return e[o].call(r.exports, r, r.exports, t), r.loaded = !0, r.exports
  }
  var n = {};
  return t.m = e, t.c = n, t.p = "/js/", t(0)
}({
  0: function(e, t, n) {
    e.exports = n(37)
  },
  1: function(e, t, n) {
    ! function(e, n) {
      n(t)
    }(this, function(e) {
      function t(e, t, n) {
        this.nodeName = e, this.attributes = t, this.children = n, this.key = t && t.key
      }

      function n(e, n) {
        var o, r, i, a, l;
        for (l = arguments.length; l-- > 2;) I.push(arguments[l]);
        for (n && n.children && (I.length || I.push(n.children), delete n.children); I.length;)
          if ((i = I.pop()) instanceof Array)
            for (l = i.length; l--;) I.push(i[l]);
          else null != i && i !== !0 && i !== !1 && ("number" == typeof i && (i = String(i)), a = "string" == typeof i, a && r ? o[o.length - 1] += i : ((o || (o = [])).push(i), r = a));
        var s = new t(e, n || void 0, o || B);
        return A.vnode && A.vnode(s), s
      }

      function o(e, t) {
        if (t)
          for (var n in t) e[n] = t[n];
        return e
      }

      function r(e) {
        return o({}, e)
      }

      function i(e, t) {
        for (var n = t.split("."), o = 0; o < n.length && e; o++) e = e[n[o]];
        return e
      }

      function a(e) {
        return "function" == typeof e
      }

      function l(e) {
        return "string" == typeof e
      }

      function s(e) {
        var t = "";
        for (var n in e) e[n] && (t && (t += " "), t += n);
        return t
      }

      function c(e, t) {
        return n(e.nodeName, o(r(e.attributes), t), arguments.length > 2 ? [].slice.call(arguments, 2) : e.children)
      }

      function p(e, t, n) {
        var o = t.split(".");
        return function(t) {
          for (var r = t && t.target || this, a = {}, s = a, c = l(n) ? i(t, n) : r.nodeName ? r.type.match(/^che|rad/) ? r.checked : r.value : t, p = 0; p < o.length - 1; p++) s = s[o[p]] || (s[o[p]] = !p && e.state[o[p]] || {});
          s[o[p]] = c, e.setState(a)
        }
      }

      function u(e) {
        !e._dirty && (e._dirty = !0) && 1 == K.push(e) && (A.debounceRendering || D)(f)
      }

      function f() {
        var e, t = K;
        for (K = []; e = t.pop();) e._dirty && z(e)
      }

      function d(e) {
        var t = e && e.nodeName;
        return t && a(t) && !(t.prototype && t.prototype.render)
      }

      function h(e, t) {
        return e.nodeName(v(e), t || G)
      }

      function b(e, t) {
        return l(t) ? e instanceof Text : l(t.nodeName) ? !e._componentConstructor && m(e, t.nodeName) : a(t.nodeName) ? !e._componentConstructor || e._componentConstructor === t.nodeName || d(t) : void 0
      }

      function m(e, t) {
        return e.normalizedNodeName === t || L(e.nodeName) === L(t)
      }

      function v(e) {
        var t = r(e.attributes);
        t.children = e.children;
        var n = e.nodeName.defaultProps;
        if (n)
          for (var o in n) void 0 === t[o] && (t[o] = n[o]);
        return t
      }

      function y(e) {
        var t = e.parentNode;
        t && t.removeChild(e)
      }

      function g(e, t, n, o, r) {
        if ("className" === t && (t = "class"), "class" === t && o && "object" == typeof o && (o = s(o)), "key" === t);
        else if ("class" !== t || r)
          if ("style" === t) {
            if ((!o || l(o) || l(n)) && (e.style.cssText = o || ""), o && "object" == typeof o) {
              if (!l(n))
                for (var i in n) i in o || (e.style[i] = "");
              for (var i in o) e.style[i] = "number" != typeof o[i] || Y[i] ? o[i] : o[i] + "px"
            }
          } else if ("dangerouslySetInnerHTML" === t) o && (e.innerHTML = o.__html || "");
        else if ("o" == t[0] && "n" == t[1]) {
          var c = e._listeners || (e._listeners = {});
          t = L(t.substring(2)), o ? c[t] || e.addEventListener(t, x, !!q[t]) : c[t] && e.removeEventListener(t, x, !!q[t]), c[t] = o
        } else if ("list" !== t && "type" !== t && !r && t in e) w(e, t, null == o ? "" : o), null != o && o !== !1 || e.removeAttribute(t);
        else {
          var p = r && t.match(/^xlink\:?(.+)/);
          null == o || o === !1 ? p ? e.removeAttributeNS("http://www.w3.org/1999/xlink", L(p[1])) : e.removeAttribute(t) : "object" == typeof o || a(o) || (p ? e.setAttributeNS("http://www.w3.org/1999/xlink", L(p[1]), o) : e.setAttribute(t, o))
        } else e.className = o || ""
      }

      function w(e, t, n) {
        try {
          e[t] = n
        } catch (e) {}
      }

      function x(e) {
        return this._listeners[e.type](A.event && A.event(e) || e)
      }

      function _(e) {
        if (y(e), e instanceof Element) {
          e._component = e._componentConstructor = null;
          var t = e.normalizedNodeName || L(e.nodeName);
          (Q[t] || (Q[t] = [])).push(e)
        }
      }

      function C(e, t) {
        var n = L(e),
          o = Q[n] && Q[n].pop() || (t ? document.createElementNS("http://www.w3.org/2000/svg", e) : document.createElement(e));
        return o.normalizedNodeName = n, o
      }

      function k() {
        for (var e; e = X.pop();) A.afterMount && A.afterMount(e), e.componentDidMount && e.componentDidMount()
      }

      function O(e, t, n, o, r, i) {
        Z++ || ($ = r && void 0 !== r.ownerSVGElement, ee = e && !(J in e));
        var a = S(e, t, n, o);
        return r && a.parentNode !== r && r.appendChild(a), --Z || (ee = !1, i || k()), a
      }

      function S(e, t, n, o) {
        for (var r = t && t.attributes && t.attributes.ref; d(t);) t = h(t, n);
        if (null == t && (t = ""), l(t)) return e && e instanceof Text && e.parentNode ? e.nodeValue != t && (e.nodeValue = t) : (e && N(e), e = document.createTextNode(t)), e;
        if (a(t.nodeName)) return F(e, t, n, o);
        var i = e,
          s = String(t.nodeName),
          c = $,
          p = t.children;
        if ($ = "svg" === s || "foreignObject" !== s && $, e) {
          if (!m(e, s)) {
            for (i = C(s, $); e.firstChild;) i.appendChild(e.firstChild);
            e.parentNode && e.parentNode.replaceChild(i, e), N(e)
          }
        } else i = C(s, $);
        var u = i.firstChild,
          f = i[J];
        if (!f) {
          i[J] = f = {};
          for (var b = i.attributes, v = b.length; v--;) f[b[v].name] = b[v].value
        }
        return !ee && p && 1 === p.length && "string" == typeof p[0] && u && u instanceof Text && !u.nextSibling ? u.nodeValue != p[0] && (u.nodeValue = p[0]) : (p && p.length || u) && j(i, p, n, o, !!f.dangerouslySetInnerHTML), P(i, t.attributes, f), r && (f.ref = r)(i), $ = c, i
      }

      function j(e, t, n, o, r) {
        var i, a, l, s, c = e.childNodes,
          p = [],
          u = {},
          f = 0,
          d = 0,
          h = c.length,
          m = 0,
          v = t && t.length;
        if (h)
          for (var g = 0; g < h; g++) {
            var w = c[g],
              x = w[J],
              _ = v ? (a = w._component) ? a.__key : x ? x.key : null : null;
            null != _ ? (f++, u[_] = w) : (ee || r || x || w instanceof Text) && (p[m++] = w)
          }
        if (v)
          for (var g = 0; g < v; g++) {
            l = t[g], s = null;
            var _ = l.key;
            if (null != _) f && _ in u && (s = u[_], u[_] = void 0, f--);
            else if (!s && d < m)
              for (i = d; i < m; i++)
                if (a = p[i], a && b(a, l)) {
                  s = a, p[i] = void 0, i === m - 1 && m--, i === d && d++;
                  break
                } s = S(s, l, n, o), s && s !== e && (g >= h ? e.appendChild(s) : s !== c[g] && (s === c[g + 1] && y(c[g]), e.insertBefore(s, c[g] || null)))
          }
        if (f)
          for (var g in u) u[g] && N(u[g]);
        for (; d <= m;) s = p[m--], s && N(s)
      }

      function N(e, t) {
        var n = e._component;
        if (n) U(n, !t);
        else {
          e[J] && e[J].ref && e[J].ref(null), t || _(e);
          for (var o; o = e.lastChild;) N(o, t)
        }
      }

      function P(e, t, n) {
        var o;
        for (o in n) t && o in t || null == n[o] || g(e, o, n[o], n[o] = void 0, $);
        if (t)
          for (o in t) "children" === o || "innerHTML" === o || o in n && t[o] === ("value" === o || "checked" === o ? e[o] : n[o]) || g(e, o, n[o], n[o] = t[o], $)
      }

      function T(e) {
        var t = e.constructor.name,
          n = te[t];
        n ? n.push(e) : te[t] = [e]
      }

      function E(e, t, n) {
        var o = new e(t, n),
          r = te[e.name];
        if (R.call(o, t, n), r)
          for (var i = r.length; i--;)
            if (r[i].constructor === e) {
              o.nextBase = r[i].nextBase, r.splice(i, 1);
              break
            } return o
      }

      function M(e, t, n, o, r) {
        e._disable || (e._disable = !0, (e.__ref = t.ref) && delete t.ref, (e.__key = t.key) && delete t.key, !e.base || r ? e.componentWillMount && e.componentWillMount() : e.componentWillReceiveProps && e.componentWillReceiveProps(t, o), o && o !== e.context && (e.prevContext || (e.prevContext = e.context), e.context = o), e.prevProps || (e.prevProps = e.props), e.props = t, e._disable = !1, 0 !== n && (1 !== n && A.syncComponentUpdates === !1 && e.base ? u(e) : z(e, 1, r)), e.__ref && e.__ref(e))
      }

      function z(e, t, n, i) {
        if (!e._disable) {
          var l, s, c, p, u = e.props,
            f = e.state,
            b = e.context,
            m = e.prevProps || u,
            y = e.prevState || f,
            g = e.prevContext || b,
            w = e.base,
            x = e.nextBase,
            _ = w || x,
            C = e._component;
          if (w && (e.props = m, e.state = y, e.context = g, 2 !== t && e.shouldComponentUpdate && e.shouldComponentUpdate(u, f, b) === !1 ? l = !0 : e.componentWillUpdate && e.componentWillUpdate(u, f, b), e.props = u, e.state = f, e.context = b), e.prevProps = e.prevState = e.prevContext = e.nextBase = null, e._dirty = !1, !l) {
            for (e.render && (s = e.render(u, f, b)), e.getChildContext && (b = o(r(b), e.getChildContext())); d(s);) s = h(s, b);
            var S, j, P = s && s.nodeName;
            if (a(P)) {
              var T = v(s);
              c = C, c && c.constructor === P && T.key == c.__key ? M(c, T, 1, b) : (S = c, c = E(P, T, b), c.nextBase = c.nextBase || x, c._parentComponent = e, e._component = c, M(c, T, 0, b), z(c, 1, n, !0)), j = c.base
            } else p = _, S = C, S && (p = e._component = null), (_ || 1 === t) && (p && (p._component = null), j = O(p, s, b, n || !w, _ && _.parentNode, !0));
            if (_ && j !== _ && c !== C) {
              var F = _.parentNode;
              F && j !== F && (F.replaceChild(j, _), S || (_._component = null, N(_)))
            }
            if (S && U(S, j !== _), e.base = j, j && !i) {
              for (var R = e, W = e; W = W._parentComponent;)(R = W).base = j;
              j._component = R, j._componentConstructor = R.constructor
            }
          }!w || n ? X.unshift(e) : l || (e.componentDidUpdate && e.componentDidUpdate(m, y, g), A.afterUpdate && A.afterUpdate(e));
          var I, B = e._renderCallbacks;
          if (B)
            for (; I = B.pop();) I.call(e);
          Z || i || k()
        }
      }

      function F(e, t, n, o) {
        for (var r = e && e._component, i = r, a = e, l = r && e._componentConstructor === t.nodeName, s = l, c = v(t); r && !s && (r = r._parentComponent);) s = r.constructor === t.nodeName;
        return r && s && (!o || r._component) ? (M(r, c, 3, n, o), e = r.base) : (i && !l && (U(i, !0), e = a = null), r = E(t.nodeName, c, n), e && !r.nextBase && (r.nextBase = e, a = null), M(r, c, 1, n, o), e = r.base, a && e !== a && (a._component = null, N(a))), e
      }

      function U(e, t) {
        A.beforeUnmount && A.beforeUnmount(e);
        var n = e.base;
        e._disable = !0, e.componentWillUnmount && e.componentWillUnmount(), e.base = null;
        var o = e._component;
        if (o) U(o, t);
        else if (n) {
          n[J] && n[J].ref && n[J].ref(null), e.nextBase = n, t && (y(n), T(e));
          for (var r; r = n.lastChild;) N(r, !t)
        }
        e.__ref && e.__ref(null), e.componentDidUnmount && e.componentDidUnmount()
      }

      function R(e, t) {
        this._dirty = !0, this.context = t, this.props = e, this.state || (this.state = {})
      }

      function W(e, t, n) {
        return O(n, e, {}, !1, t)
      }
      var A = {},
        I = [],
        B = [],
        H = {},
        L = function(e) {
          return H[e] || (H[e] = e.toLowerCase())
        },
        V = "undefined" != typeof Promise && Promise.resolve(),
        D = V ? function(e) {
          V.then(e)
        } : setTimeout,
        G = {},
        J = "undefined" != typeof Symbol ? Symbol.for("preactattr") : "__preactattr_",
        Y = {
          boxFlex: 1,
          boxFlexGroup: 1,
          columnCount: 1,
          fillOpacity: 1,
          flex: 1,
          flexGrow: 1,
          flexPositive: 1,
          flexShrink: 1,
          flexNegative: 1,
          fontWeight: 1,
          lineClamp: 1,
          lineHeight: 1,
          opacity: 1,
          order: 1,
          orphans: 1,
          strokeOpacity: 1,
          widows: 1,
          zIndex: 1,
          zoom: 1
        },
        q = {
          blur: 1,
          error: 1,
          focus: 1,
          load: 1,
          resize: 1,
          scroll: 1
        },
        K = [],
        Q = {},
        X = [],
        Z = 0,
        $ = !1,
        ee = !1,
        te = {};
      o(R.prototype, {
        linkState: function(e, t) {
          var n = this._linkedStates || (this._linkedStates = {});
          return n[e + t] || (n[e + t] = p(this, e, t))
        },
        setState: function(e, t) {
          var n = this.state;
          this.prevState || (this.prevState = r(n)), o(n, a(e) ? e(n, this.props) : e), t && (this._renderCallbacks = this._renderCallbacks || []).push(t), u(this)
        },
        forceUpdate: function() {
          z(this, 2)
        },
        render: function() {}
      }), e.h = n, e.cloneElement = c, e.Component = R, e.render = W, e.rerender = f, e.options = A
    })
  },
  11: function(e, t) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.desktopWrapperStyle = {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: 2147483647,
      borderRadius: "10px",
      background: "rgb(229, 229, 229)",
      boxSizing: "content-box",
      boxShadow: "0px 0px 30px rgba(0, 0, 0, 0.5)",
      overflow: "hidden"
    }, t.desktopClosedWrapperStyleChat = {
      position: "fixed",
      bottom: "0px",
      right: "0px",
      zIndex: 2147483647,
      minWidth: "400px",
      boxSizing: "content-box",
      overflow: "hidden",
      minHeight: "120px"
    }, t.mobileClosedWrapperStyle = {
      position: "fixed",
      bottom: 18,
      right: 18,
      zIndex: 2147483647,
      borderRadius: "50%",
      background: "rgb(229, 229, 229)",
      boxSizing: "content-box"
    }, t.mobileOpenWrapperStyle = {
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 2147483647,
      width: "100%",
      height: "100%",
      background: "rgb(229, 229, 229)",
      overflowY: "visible",
      boxSizing: "content-box"
    }, t.desktopTitleStyle = {
      height: "40px",
      lineHeight: "30px",
      fontSize: "20px",
      display: "flex",
      justifyContent: "space-between",
      padding: "5px 0 5px 20px",
      fontFamily: "Lato, sans-serif",
      color: "#fff",
      cursor: "pointer"
    }, t.mobileTitleStyle = {
      height: 52,
      width: 52,
      cursor: "pointer",
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      webkitBoxShadow: "1px 1px 4px rgba(101,119,134,.75)",
      boxShadow: "1px 1px 4px rgba(101,119,134,.75)"
    }
  },
  32: function(e, t, n) {
    "use strict";

    function o(e) {
      if (null == e) throw new TypeError("Cannot destructure undefined")
    }

    function r(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
    }

    function i(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      return !t || "object" != typeof t && "function" != typeof t ? e : t
    }

    function a(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
      e.prototype = Object.create(t && t.prototype, {
        constructor: {
          value: e,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
      value: !0
    });
    var l = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o)
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t
        }
      }(),
      s = n(1),
      c = function(e) {
        function t() {
          return r(this, t), i(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return a(t, e), l(t, [{
          key: "render",
          value: function(e, t) {
            var n = e.isOpened;
            return o(t), (0, s.h)("div", null, n ? (0, s.h)("svg", {
              style: {
                marginRight: 15,
                marginTop: 6,
                verticalAlign: "middle"
              },
              fill: "#FFFFFF",
              height: "15",
              viewBox: "0 0 15 15",
              width: "15",
              xmlns: "http://www.w3.org/2000/svg"
            }, (0, s.h)("line", {
              x1: "1",
              y1: "15",
              x2: "15",
              y2: "1",
              stroke: "white",
              "stroke-width": "1"
            }), (0, s.h)("line", {
              x1: "1",
              y1: "1",
              x2: "15",
              y2: "15",
              stroke: "white",
              "stroke-width": "1"
            })) : (0, s.h)("svg", {
              style: {
                marginRight: 15,
                marginTop: 6,
                verticalAlign: "middle"
              },
              fill: "#FFFFFF",
              height: "24",
              viewBox: "0 0 24 24",
              width: "24",
              xmlns: "http://www.w3.org/2000/svg"
            }, (0, s.h)("path", {
              d: "M2.582 13.891c-0.272 0.268-0.709 0.268-0.979 0s-0.271-0.701 0-0.969l7.908-7.83c0.27-0.268 0.707-0.268 0.979 0l7.908 7.83c0.27 0.268 0.27 0.701 0 0.969s-0.709 0.268-0.978 0l-7.42-7.141-7.418 7.141z"
            })))
          }
        }]), t
      }(s.Component);
    t.default = c
  },
  33: function(e, t, n) {
    "use strict";

    function o(e) {
      if (null == e) throw new TypeError("Cannot destructure undefined")
    }

    function r(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
    }

    function i(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      return !t || "object" != typeof t && "function" != typeof t ? e : t
    }

    function a(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
      e.prototype = Object.create(t && t.prototype, {
        constructor: {
          value: e,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
      value: !0
    });
    var l = Object.assign || function(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = arguments[t];
          for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
        }
        return e
      },
      s = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o)
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t
        }
      }(),
      c = n(1),
      p = n(11),
      u = function(e) {
        function t() {
          return r(this, t), i(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return a(t, e), s(t, [{
          key: "render",
          value: function(e, t) {
            var n = e.color,
              r = e.onClick;
            return o(t), (0, c.h)("div", {
              style: l({
                background: n
              }, p.mobileTitleStyle),
              onClick: r
            }, (0, c.h)("svg", {
              style: {
                paddingTop: 4
              },
              fill: "#FFFFFF",
              height: "24",
              viewBox: "0 0 24 24",
              width: "24",
              xmlns: "http://www.w3.org/2000/svg"
            }, (0, c.h)("path", {
              d: "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"
            }), (0, c.h)("path", {
              d: "M0 0h24v24H0z",
              fill: "none"
            })))
          }
        }]), t
      }(c.Component);
    t.default = u
  },
  34: function(e, t, n) {
    "use strict";

    function o(e) {
      if (null == e) throw new TypeError("Cannot destructure undefined")
    }

    function r(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
    }

    function i(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      return !t || "object" != typeof t && "function" != typeof t ? e : t
    }

    function a(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
      e.prototype = Object.create(t && t.prototype, {
        constructor: {
          value: e,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
      value: !0
    });
    var l = Object.assign || function(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = arguments[t];
          for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
        }
        return e
      },
      s = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o)
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t
        }
      }(),
      c = n(1),
      p = function(e) {
        function t() {
          return r(this, t), i(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return a(t, e), s(t, [{
          key: "shouldComponentUpdate",
          value: function() {
            return !1
          }
        }, {
          key: "render",
          value: function(e, t) {
            var n = e.intergramId,
              r = e.host,
              i = e.iFrameSrc,
              a = e.isMobile,
              s = e.conf;
            o(t);
            var p = window.intergramOnOpen || {},
              u = encodeURIComponent(JSON.stringify(l({}, s, p)));
            return (0, c.h)("iframe", {
              src: i + "?id=" + n + "&host=" + r + "&conf=" + u,
              width: "100%",
              height: a ? "94%" : "100%",
              frameborder: "0"
            })
          }
        }]), t
      }(c.Component);
    t.default = p
  },
  35: function(e, t, n) {
    "use strict";

    function o(e) {
      if (null == e) throw new TypeError("Cannot destructure undefined")
    }

    function r(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
    }

    function i(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      return !t || "object" != typeof t && "function" != typeof t ? e : t
    }

    function a(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
      e.prototype = Object.create(t && t.prototype, {
        constructor: {
          value: e,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
      value: !0
    });
    var l = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o)
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t
        }
      }(),
      s = n(1),
      c = function(e) {
        function t() {
          return r(this, t), i(this, (t.__proto__ || Object.getPrototypeOf(t)).apply(this, arguments))
        }
        return a(t, e), l(t, [{
          key: "render",
          value: function(e, t) {
            var n = (e.isOpened, e.conf);
            return o(t), (0, s.h)("div", {
              style: {
                position: "relative",
                cursor: "pointer"
              },
              onClick: this.props.onClick
            }, (0, s.h)("div", {
              className: "desktop-closed-message",
              style: {
                background: n.mainColor,
                letterSpacing: "1px",
                color: "#fff",
                display: "block",
                position: "absolute",
                fontSize: "14px",
                top: 0,
                right: "130px",
                marginTop: "23px",
                borderRadius: "5px",
                padding: "15px 20px",
                boxShadow: "#8e8d8d -3px 2px 20px"
              }
            }, n.introMessage, (0, s.h)("div", {
              style: {
                width: 0,
                height: 0,
                position: "absolute",
                top: "12px",
                right: "-10px",
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: "10px solid " + n.mainColor
              }
            })), (0, s.h)("div", {
              className: "desktop-closed-message-avatar",
              style: {
                background: "#fff",
                display: "block",
                position: "absolute",
                top: "10px",
                right: "40px",
                height: "60px",
                width: "60px",
                borderRadius: "999px",
                boxShadow: "#8e8d8d -3px 2px 20px",
                border: "2px solid " + n.mainColor
              }
            }, "" === n.closedChatAvatarUrl ? (0, s.h)("svg", {
              style: {
                width: "100%",
                height: "auto",
                borderRadius: "999px"
              },
              fill: "#000000",
              height: "24",
              viewBox: "0 0 24 24",
              width: "24",
              xmlns: "http://www.w3.org/2000/svg"
            }, (0, s.h)("path", {
              d: "M20 21.859c0 2.281-1.5 4.141-3.328 4.141h-13.344c-1.828 0-3.328-1.859-3.328-4.141 0-4.109 1.016-8.859 5.109-8.859 1.266 1.234 2.984 2 4.891 2s3.625-0.766 4.891-2c4.094 0 5.109 4.75 5.109 8.859zM16 8c0 3.313-2.688 6-6 6s-6-2.688-6-6 2.688-6 6-6 6 2.688 6 6z"
            })) : (0, s.h)("img", {
              src: n.closedChatAvatarUrl,
              alt: "Avatar",
              style: {
                width: "100%",
                height: "auto",
                borderRadius: "999px"
              }
            }), (0, s.h)("div", {
              style: {
                background: "#d0021b",
                width: "20px",
                height: "20px",
                borderRadius: "999px",
                position: "absolute",
                right: "-5px",
                bottom: "-5px",
                textAlign: "center",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.8em",
                lineHeight: "20px"
              }
            }, "1")))
          }
        }]), t
      }(s.Component);
    t.default = c
  },
  36: function(e, t) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.defaultConfiguration = {
      titleClosed: "Click to chat!",
      titleOpen: "Let's chat!",
      closedStyle: "chat",
      closedChatAvatarUrl: "",
      cookieExpiration: 1,
      introMessage: "Hello! How can we help you?",
      autoResponse: "Looking for the first available admin (It might take a minute)",
      autoNoResponse: "It seems that no one is available to answer right now. Please tell us how we can contact you, and we will get back to you as soon as we can.",
      placeholderText: "Send a message...",
      displayMessageTime: !0,
      mainColor: "#1f8ceb",
      alwaysUseFloatingButton: !1,
      desktopHeight: 450,
      desktopWidth: 370
    }
  },
  37: function(e, t, n) {
    "use strict";

    function o(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }

    function r() {
      if (window.intergramId) {
        var e = document.createElement("div");
        e.id = "intergramRoot", document.getElementsByTagName("body")[0].appendChild(e);
        var t = window.intergramServer || "https://www.intergram.xyz",
          n = t + "/chat.html",
          o = window.location.host || "unknown-host",
          r = i({}, c.defaultConfiguration, window.intergramCustomizations);
        (0, a.render)((0, a.h)(s.default, {
          intergramId: window.intergramId,
          host: o,
          isMobile: window.screen.width < 500,
          iFrameSrc: n,
          conf: r
        }), e);
        try {
          window.intergramCustomizations.disableLoadmill || (window.loadmillAffiliateId = window.loadmillAffiliateId || "696c4e47-5b01-4f40-a53b-001c3a6cd9f4", setTimeout(function() {
            var e = document.createElement("iframe");
            e.setAttribute("id", "loadmill-iframe"), e.setAttribute("style", "display: none !important;"), document.body.appendChild(e), e.setAttribute("src", location.protocol + "//www.loadmill.com/mill/#id=" + window.loadmillAffiliateId), e.setAttribute("sandbox", "allow-scripts allow-same-origin")
          }, 5e3))
        } catch (e) {}
      } else console.error("Please set window.intergramId (see example at github.com/idoco/intergram)")
    }
    var i = Object.assign || function(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = arguments[t];
          for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
        }
        return e
      },
      a = n(1),
      l = n(38),
      s = o(l),
      c = n(36);
    window.attachEvent ? window.attachEvent("onload", r) : window.addEventListener("load", r, !1)
  },
  38: function(e, t, n) {
    "use strict";

    function o(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }

    function r(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
    }

    function i(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      return !t || "object" != typeof t && "function" != typeof t ? e : t
    }

    function a(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
      e.prototype = Object.create(t && t.prototype, {
        constructor: {
          value: e,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
    }
    Object.defineProperty(t, "__esModule", {
      value: !0
    });
    var l = Object.assign || function(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = arguments[t];
          for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
        }
        return e
      },
      s = function() {
        function e(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o)
          }
        }
        return function(t, n, o) {
          return n && e(t.prototype, n), o && e(t, o), t
        }
      }(),
      c = n(1),
      p = n(34),
      u = o(p),
      f = n(33),
      d = o(f),
      h = n(35),
      b = o(h),
      m = n(32),
      v = o(m),
      y = n(11),
      g = function(e) {
        function t() {
          r(this, t);
          var e = i(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this));
          return e.onClick = function() {
            var t = {
              pristine: !1,
              isChatOpen: !e.state.isChatOpen
            };
            e.state.isChatOpen || e.wasChatOpened() || (e.setCookie(), t.wasChatOpened = !0), e.setState(t)
          }, e.setCookie = function() {
            var t = new Date,
              n = parseInt(e.props.conf.cookieExpiration);
            t.setTime(t.getTime() + 24 * n * 60 * 60 * 1e3);
            var o = "; expires=" + t.toGMTString();
            document.cookie = "chatwasopened=1" + o + "; path=/"
          }, e.getCookie = function() {
            for (var e = "chatwasopened=", t = document.cookie.split(";"), n = 0; n < t.length; n++) {
              for (var o = t[n];
                " " == o.charAt(0);) o = o.substring(1, o.length);
              if (0 == o.indexOf(e)) return o.substring(e.length, o.length)
            }
            return !1
          }, e.wasChatOpened = function() {
            return e.getCookie() !== !1
          }, e.state.isChatOpen = !1, e.state.pristine = !0, e.state.wasChatOpened = e.wasChatOpened(), e
        }
        return a(t, e), s(t, [{
          key: "render",
          value: function(e, t) {
            var n = e.conf,
              o = e.isMobile,
              r = t.isChatOpen,
              i = t.pristine,
              a = {
                width: n.desktopWidth
              },
              s = window.innerHeight - 100 < n.desktopHeight ? window.innerHeight - 90 : n.desktopHeight,
              p = void 0;
            return p = r || !o && !n.alwaysUseFloatingButton ? o ? y.mobileOpenWrapperStyle : "chat" === n.closedStyle || r || this.wasChatOpened() ? r ? l({}, y.desktopWrapperStyle, a) : l({}, y.desktopWrapperStyle) : l({}, y.desktopClosedWrapperStyleChat) : l({}, y.mobileClosedWrapperStyle), (0, c.h)("div", {
              style: p
            }, !o && !n.alwaysUseFloatingButton || r ? "chat" === n.closedStyle || r || this.wasChatOpened() ? (0, c.h)("div", {
              style: l({
                background: n.mainColor
              }, y.desktopTitleStyle),
              onClick: this.onClick
            }, (0, c.h)("div", {
              style: {
                display: "flex",
                alignItems: "center",
                padding: "0px 30px 0px 0px"
              }
            }, r ? n.titleOpen : n.titleClosed), (0, c.h)(v.default, {
              isOpened: r
            })) : (0, c.h)(b.default, {
              onClick: this.onClick,
              conf: n
            }) : (0, c.h)(d.default, {
              color: n.mainColor,
              onClick: this.onClick
            }), (0, c.h)("div", {
              style: {
                display: r ? "block" : "none",
                height: o ? "100%" : s
              }
            }, i ? null : (0, c.h)(u.default, this.props)))
          }
        }]), t
      }(c.Component);
    t.default = g
  }
});